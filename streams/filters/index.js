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

const chalk = require('chalk');
const callTellfinder = require('../tell-api');
const IncomingWebhook = require('@slack/client').IncomingWebhook;
const following = require('../following');

const url = process.env.slackSearchUrl;
const webhook = new IncomingWebhook(url);

module.exports.streamFilter  = (tweet, client) => {

    const shouldProcess = (tweet) => {
        return new Promise((resolve) => {
            let shouldProcess = !isRetweet(tweet);

            // Process the tweet on if we're following the account that tweeted it
            following.getFollowing(client)
                .then((ids) => {
                    if (ids.filter(id => id == tweet.user.id).length == 0) {
                        shouldProcess = false;
                    }

                    if (shouldProcess) {
                        resolve(tweet);
                    }
                    resolve(null);
                })
                .catch((err) => reject(err));
        });
    };

    // Do some preliminary checks to make sure this is a tweet that should be considered for processing
    shouldProcess(tweet)
        .then((tweet) => {
            if (tweet === null) {
                return;
            }

            const tweetText = tweet.text;
            const tweetAuthor = tweet.user.screen_name;

            console.log('Received tweet by ' + tweetAuthor + ': ' + tweetText);

            // Only run the queries if it's a 'missing persons' related tweet
            if(getMissing(tweet)){

                // Get the images/media from the tweet
                const imageUrls = getImages(tweet);

                if(imageUrls.length > 0){

                    const user = process.env.limit_direct_messages === 'true' ? process.env.direct_message_recipient : tweet.user.id_str;
                    const tweetLink = `http://twitter.com/${tweet.user.id_str}/status/${tweet.id_str}`;

                    // Log the message to slack
                    const slackMessage = `Executing TellFinder search for tweet: ${tweetLink}`;
                    webhook.send(slackMessage, function(err, header, statusCode) {
                        if (err) {
                            console.log('Error:', err);
                        } else {
                            console.log('Received', statusCode, 'from Slack');
                        }
                    });

                    // Invoke the TellFinder similar image API
                    callTellfinder.callImageApi(imageUrls, client, user, tweetLink);

                } else {
                    console.log('No image found in tweet');
                }
            }

        });
};

/**
 * Ensures that a tweet is related to a missing person
 * @param tweet         the tweet object
 * @returns {boolean}   true if it should be processed by TellFinder, false otherwise
 */
const getMissing = (tweet) => {
  return tweet.text.includes('MISSING:');
};

/**
 * Checks if a tweet is a retweet
 * @param tweet         the tweet object
 * @returns {boolean}   true if this was a retweet, false otherwise
 */
const isRetweet = (tweet) => {
    return tweet.hasOwnProperty('retweeted_status');
};

/**
 * Get an array of images from the tweet object
 * @param tweet         the tweet instance
 * @returns {Array}     an array of image urls
 */
const getImages = (tweet) => {
  const mediaArr = tweet.extended_entities && tweet.extended_entities.media;
  if(mediaArr && mediaArr.length) {
      return mediaArr
          .map(media => media.media_url)
          .filter(url => url.endsWith('.jpg') || url.endsWith('.png'));
  }
  return [];
};