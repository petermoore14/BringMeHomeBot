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
    const baseUrl = env.parsed.baseUrl;
    const sim = '/v1/similarimages';
    const bitly = new Bitly(env.parsed.bitly);
    //go through each image
    imageArray.forEach(img => {
        //call facematching api
        console.log('Calling Similar Image API for image: ' + img);
        rp(options(baseUrl + sim, img)).then(res => {
            // if we get at least one match create link to bring me home static page
            if(res.similarHashes.length > 0){
                console.log('HIT FOUND: ' + img);
                const hash = computeHash(img);
                const encodedUri = encodeURIComponent(img);
                const bringMeHomeUrl =  baseUrl + '/bringmehome?url=' + encodedUri + '&hash=' + hash.toUpperCase();
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
}

const options = (url, img) => {
    return {
        method: 'POST',
        uri:url,
        body: {
            url:img
        },
        auth:{
            user:'tf2api@uncharted.software',
            pass:'tf2api1234'
        },
        json: true
    }
}

const computeHash = (img) =>{
    return sha1(img + env.parsed.hash_secret)
}