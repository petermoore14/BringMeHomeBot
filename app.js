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
(async () => {
    // Log to console with timestamps
    console.logCopy = console.log.bind(console);
    console.log = function(data)
    {
        var currentDate = '[' + new Date().toUTCString() + '] ';
        this.logCopy(currentDate, data);
    };

// Load the environment
    require('node-env-file')('.env', {raise: false});

    const express = require('express')
    const app = express();

    const Twitter = require('twitter');
    const filter = require('./modules/filters');
    const error = require('./modules/error');
    const following = require('./modules/following');
    const slack = require('./modules/slack');
    const keys = require('./modules/keys');
    const tweetApi = require('./modules/tweet');

    const conn = {
        consumer_key: process.env.consumer_key,
        consumer_secret: process.env.consumer_secret,
        access_token_key: process.env.access_token_key,
        access_token_secret: process.env.access_token_secret
    };

    console.log('Application started');
    const client = new Twitter(conn);

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

                    const reset = new Date(0);
                    reset.setUTCSeconds(info.reset);

                    used.push({
                        limit: info.limit,
                        remaining: info.remaining,
                        reset: reset.toUTCString(),
                        endpoint: endpointKey
                    });
                }
            });
        });
        console.log(used);
    });

    console.log('Created connection to Twitter api for ' + conn.consumer_key);

    let streamHandle = null;
    let restartTimeoutId = null;
    const startStream = (client, streamParams) => {
        client.stream('statuses/filter', streamParams, (stream) => {
            streamHandle = stream;
            stream.on('data', (tweet) => filter.streamFilter(tweet, client));
            stream.on('error', (err) => {
                error.streamError(err);

                // If there was an error, restart the stream in 3 minutes
                if (restartTimeoutId === null) {
                    const restartHoldoff = 3;
                    console.log(`Attempting to restart stream in ${restartHoldoff} minutes`);
                    restartTimeoutId = setTimeout(() => {

                        restartTimeoutId = null;
                        console.log('Restarting streams');
                        stopStream();
                        startStream(client, streamParams);

                    }, restartHoldoff * 60 * 1000);
                }
            });
        });
    };
    const stopStream = () => {
        if (streamHandle !== null) {
            streamHandle.destroy();
            streamHandle = null;
        }
    };

    // Get the list of followers and start the stream
    try {
        const followingIds = await following.getFollowing(client);
        const followingStr = followingIds.toString();
        console.log('Following ' + followingIds.length + ' accounts: ' + followingStr);
        startStream(client, {
            follow: followingStr
        });
    } catch (err) {
        error.streamError(err);
    }

    // Setup a request to update the followers every 5 mins.  This is required by twitter API and should NOT be
    // modified or else we will get rate limited.  If the stream is dead, restart it
    setInterval(async () => {
        let oldIds = await following.getFollowing(client);
        let newIds = await following.updateFollowing(client);

        // If the following count has change, restart the streams
        if (oldIds.length !== newIds.length) {

            const logMsg = `Following count changed from ${oldIds.length} to ${newIds.length}.  Restarting streams.`;
            console.log(logMsg);
            slack.log(logMsg);

            stopStream();
            startStream(client, {
                follow: newIds.toString()
            });
        }
    },Math.floor(1000 * 60 * 5));

    // Get uptime status
    const upDate = new Date();
    app.get('/', (req, res) => {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Up since ' + upDate.toISOString());
    });

    // Process a tweet by tweet ID
    app.get('/:tweetid', async (req,res) => {

        const key = req.header('bringmehome-api-key');
        if (keys.isValidKey(key)) {

            const tweetId = req.param('tweetid');

            // Run the processing on the tweet id provided
            try {
                const tweet = await tweetApi.getById(tweetId, client);
                filter.streamFilter(tweet, client);
                res.writeHead(200);
                res.end();
            } catch (err) {
                res.writeHead(500);
                res.end(err);
            }
        } else {
            res.writeHead(401);
            res.end('Access denied');
        }
    });

    app.listen(process.env.server_listen_port, () => {
        console.log('Listening on port ' + process.env.server_listen_port);
    });

})();