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
 
const http = require('http');

const Twitter = require('twitter');
const env = require('dotenv').config();

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

client.get('friends/list', (error, friends, response) => {
    if(error) throw error;
    const following = friends.users.map(friend => friend.id_str).toString();
    const friendlyFollowers = friends.users.map(friend => friend.name).toString()
    console.log('Following:' + friendlyFollowers);

    const streamParameters = {
        follow: following
    };
    startStream(client, streamParameters);
});

// Load the http module to create an http server.

// // Configure our HTTP server to respond with Hello World to all requests.
const server = http.createServer((request, response) => {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("Up\n");
});

server.listen(process.env.server_listen_port);
