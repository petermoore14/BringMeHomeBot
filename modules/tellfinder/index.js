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
 
const rp = require('request-promise');
const Bitly = require('bitly');
const messages = require('../messages');
const sha1 = require('sha1');
const chalk = require('chalk');
const slack = require('../slack');
const logo = require('../logo');

module.exports.callImageApi = (imageArray, tweetClient, user, tweetLink) => {
    const apiBaseUrl = process.env.apiBaseUrl;
    const sim = '/similarimages';
    const bitly = new Bitly(process.env.bitly);

    // For each image in the tweet, call the face API and check for matching images
    imageArray.forEach(async img => {

        console.log(chalk.red('Calling Similar Image API for image: ' + img));
        slack.image(img);

        const res = await rp(options(apiBaseUrl + sim, img));

        // If there are image hits and some are not logos, notify the corresponding account
        if(res.similarHashes.length > 0 && !await logo.all(res.similarUrls)){

            console.log('HIT FOUND: ' + img);

            const deploymentBaseUrl = process.env.deploymentBaseUrl;
            const encodedTweetUri = encodeURIComponent(tweetLink);
            const encodedImageUri = encodeURIComponent(img);
            const hash = sha1(tweetLink + img + process.env.hash_secret);
            const bringMeHomeUrl = deploymentBaseUrl + '/bringmehome?tweetUrl=' + encodedTweetUri + '&url=' + encodedImageUri + '&hash=' + hash.toUpperCase();

            console.log('URL: ' + bringMeHomeUrl);

            // Shorten the URL link to the bringmehome endpoint in tellfinder and notify the account
            try {
                const bitlyResponse = await bitly.shorten(bringMeHomeUrl);
                const short_url = bitlyResponse.data.url;
                messages.sendMessage(tweetClient, {
                    user_id: user,
                    text: 'More information about Missing individual at: ' + short_url
                }, tweetLink);
            }
            catch (err) {
                throw err;
            }

        } else {
            console.log(`no similar images to ${img}`);
        }
    });
};

const options = (url, img) => {
    return {
        method: 'POST',
        uri:url,
        body: {
            url:img
        },
        headers: {
            'x-api-key':  process.env.tellfinder_api_key
        },
        json: true
    }
};