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
 
var rp = require('request-promise');
var Bitly = require('bitly');
const messages = require('../messages');
const env = require('dotenv').config();
var sha1 = require('sha1');

//todo hook into tellfinder face matching api
module.exports.callFaceApi = (imageArray, tweetClient, user, tweetLink) => {
    const apiBaseUrl = env.parsed.apiBaseUrl;
    const sim = '/similarimages';
    const bitly = new Bitly(env.parsed.bitly);

    // For each image in the tweet, call the face API and check for matching images
    imageArray.forEach(img => {

        console.log('Calling Similar Image API for image: ' + img);

        rp(options(apiBaseUrl + sim, img)).then(res => {

            // If there are image hits, notify the corresponding account
            if(res.similarHashes.length > 0){
                console.log('HIT FOUND: ' + img);

                const hash = computeHash(img);
                const encodedUri = encodeURIComponent(img);
                const deploymentBaseUrl = env.parsed.deploymentBaseUrl
                const bringMeHomeUrl =  deploymentBaseUrl + '/bringmehome?url=' + encodedUri + '&hash=' + hash.toUpperCase();

                console.log('URL: ' + bringMeHomeUrl);

                // Shorten the URL link to the bringmehome endpoint in tellfinder and notify the account
                bitly.shorten(bringMeHomeUrl)
                .then((response) => {
                    var short_url = response.data.url
                    messages.sendMessage(tweetClient, {user_id: user, text: 'More information about Missing individual at: ' + short_url }, tweetLink);
                }, (error) => {
                    throw error;
                });
            } else {
                console.log(`no similar images to ${img}`);
            }
         }).catch(err => {
            throw err
         });
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
            'x-api-key':  env.parsed.tellfinder_api_key
        },
        json: true
    }
};

const computeHash = (img) =>{
    return sha1(img + env.parsed.hash_secret)
};