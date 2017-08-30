/*
 * Copyright 2017 Uncharted Software Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Load the environment
require('node-env-file')('.env', {raise: false});
 
const http = require('http');
const Twitter = require('twitter');
const filter = require('./streams/filters');
const error = require('./streams/error');


const conn = {
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token_key: process.env.access_token_key,
    access_token_secret: process.env.access_token_secret
};


console.log('Application started');
const client = new Twitter(conn);

client.get('application/rate_limit_status', (err,response) => {
    console.log(JSON.stringify(response));
    if (err) console.log(JSON.stringify(err));
});

console.log('Created connection to Twitter api for ' + conn.consumer_key);

const startStream = (client, streamParams) => { 
    client.stream('statuses/filter', streamParams, (stream) => {
        stream.on('data', (tweet) => filter.streamFilter(tweet, client));
        stream.on('error', error.streamError);
    });
};

client.get('friends/ids', {stringify_ids: true},(error, response) => {
    if(error) {
        console.log(error);
    }
    const following = response.ids.toString();
    console.log('Following ' + response.ids.length + ' accounts: ' + following);

    const streamParameters = {
        follow: following
    };
    startStream(client, streamParameters);
});

// Load the http module to create an http server.

// // Configure our HTTP server to respond with Hello World to all requests.
const upDate = new Date();
const server = http.createServer((request, response) => {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Up since ' + upDate.toISOString());
});

console.log('Listening on port ' + process.env.server_listen_port);
server.listen(process.env.server_listen_port);
