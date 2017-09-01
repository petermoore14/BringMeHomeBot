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

// Log to console with timestamps
console.logCopy = console.log.bind(console);
console.log = function(data)
{
    var currentDate = '[' + new Date().toUTCString() + '] ';
    this.logCopy(currentDate, data);
};

// Load the environment
require('node-env-file')('.env', {raise: false});
 
const http = require('http');
const Twitter = require('twitter');
const filter = require('./streams/filters');
const error = require('./streams/error');
const following = require('./streams/following');
const slack = require('./streams/slack');
const tweetApi = require('./streams/tweet');

const conn = {
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token_key: process.env.access_token_key,
    access_token_secret: process.env.access_token_secret
};



console.log('Application started');
const client = new Twitter(conn);

// Debug function to run the processing on a given tweet
// tweetApi.getById('[some_tweet_id]',client)
//     .then((tweet) => {
//         filter.streamFilter(tweet,client)
//     });

// Get the rate usage for each endpoint.  Only show endpoints that have been used
client.get('application/rate_limit_status', (err,response) => {
    if (err) {
        console.log(JSON.stringify(err));
        return;
    }
    const used = [];
    Object.keys(response.resources).forEach(key => {
        Object.keys(response.resources[key]).forEach(endpointKey => {
            const info = response.resources[key][endpointKey];
            if (info.limit != info.remaining) {
                used.push({
                    limit: info.limit,
                    remaining: info.remaining,
                    reset: info.reset,
                    endpoint: endpointKey
                });
            }
        });
    });
    console.log(used);
});

console.log('Created connection to Twitter api for ' + conn.consumer_key);

let streamHandle = null;
const startStream = (client, streamParams) => {
    client.stream('statuses/filter', streamParams, (stream) => {
        streamHandle = stream;
        stream.on('data', (tweet) => filter.streamFilter(tweet, client));
        stream.on('error', error.streamError);
    });
};
const stopStream = () => {
    streamHandle.destroy();
    streamHandle = null;
};

// Get the list of followers and start the stream
following.getFollowing(client)
    .then((ids) => {

        const followingStr = ids.toString();
        console.log('Following ' + ids.length + ' accounts: ' + followingStr);
        startStream(client, {
            follow: followingStr
        });
    })
    .catch((err) => {
        err.streamError('Unable to start stream');
    });

// Setup a request to update the followers every 5 mins.  This is required by twitter API and should NOT be
// modified or else we will get rate limited
setInterval(() => {
    following.getFollowing(client)
        .then((oldIds) => {

            following.updateFollowing(client)
                .then((newIds) => {
                    if (oldIds.length !== newIds.length) {

                        const logMsg = `Following count changed from ${oldIds.length} to ${newIds.length}.  Restarting streams.`;
                        console.log(logMsg);
                        slack.log(logMsg);

                        stopStream();
                        startStream(client, {
                            follow: newIds.toString()
                        });
                    }
                });

        });
},Math.floor(1000 * 60 * 5));


// Load the http module to create an http server.

// // Configure our HTTP server to respond with Hello World to all requests.
const upDate = new Date();
const server = http.createServer((request, response) => {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Up since ' + upDate.toISOString());
});

console.log('Listening on port ' + process.env.server_listen_port);
server.listen(process.env.server_listen_port);
