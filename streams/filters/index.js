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

module.exports.streamFilter  = (tweet, client) => {

    console.log("Recieved tweet: " + tweet.text);

    // If it is not a retweet and it is a missing persons related tweet
    if(getMissing(tweet) && tweet.retweeted == false){

        // Get the images/media from the tweet
        const imageUrls = getImages(tweet);

        if(imageUrls.length > 0){

            const user = process.env.limit_direct_messages === 'true' ? process.env.direct_message_recipient : tweet.user.id_str;
            const tweetLink = `http://twitter.com/${tweet.user.id_str}/status/${tweet.id_str}`;

            // Invoke the TellFinder similar image API
            callTellfinder.callImageApi(imageUrls, client, user, tweetLink);
        } else {
            console.log(chalk.red('ERROR: no image'));
        }
    }
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