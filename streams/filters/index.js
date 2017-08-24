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
const callTellfinder = require('../tell-api')
const env = require('dotenv').config();
module.exports.streamFilter  = (tweet, client) => {
    console.log("Recieved tweet: " + tweet.text);
    if(getMissing(tweet) && tweet.retweeted == false){
        const imgs = getImages(tweet);
        if(checkIsImages(imgs).length > 0){
            const user = env.parsed.limit_direct_messages === 'true' ? env.parsed.direct_message_recipient : tweet.user.id_str;
            const tweetLink = `http://twitter.com/${tweet.user.id_str}/status/${tweet.id_str}`
            callTellfinder.callFaceApi(imgs, client, user, tweetLink);
        } else {
            console.log(chalk.red('ERROR: no image'));
        }
    }
};

const getMissing = (tweet) => {
  return tweet.text.includes('MISSING:');
}

const getImages = (tweet) => {
  const mediaArr = tweet.extended_entities && tweet.extended_entities.media;
  if(mediaArr && mediaArr.length) {
      return mediaArr.map(media => media.media_url);
  }
  return [];
}

const checkIsImages = (urls) => {
    return urls.filter(url => url.endsWith('.jpg') || url.endsWith('.png'));
}