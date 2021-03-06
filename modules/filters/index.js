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
const chalk = require('chalk');
const callTellfinder = require('../tellfinder');
const following = require('../following');
const cheerio = require('cheerio');
const splash = require('../splash');
const readability = require('../readability');
const URL = require('url');
const unshorten = require('../unshorten');
const slack = require('../slack');

const supportedImageTypes = ['jpg','jpeg','png'];


module.exports.streamFilter  = async (tweetIn, client) => {

    // Do some preliminary checks to make sure this is a tweet that should be considered for processing
    const tweet = await isFromFollower(tweetIn,client);

    if (tweet === null) {
        return;
    }

    const tweetText = getText(tweet);
    const tweetAuthor = tweet.user.screen_name;
    const tweetLink = `https://twitter.com/${tweet.user.id_str}/status/${tweet.id_str}`;

    const logMsg = `${tweetLink} by ${tweetAuthor}: ${tweetText.replace(/\r?\n|\r/g,' ')}`;
    console.log(logMsg);
    slack.log(logMsg);

    // Only run the queries if it's a 'missing persons' related tweet
    if(getMissing(tweet)){

        // Get the images/media from the tweet
        const imageUrls = await getImages(tweet);

        if (imageUrls.length > 0) {

            const user = process.env.limit_direct_messages === 'true' ? process.env.direct_message_recipient : tweet.user.id_str;

            // Log the message as a slack search
            slack.search(logMsg);
            console.log(chalk.red('SEARCHING: ' + logMsg));

            // Invoke the TellFinder similar image API
            callTellfinder.callImageApi(imageUrls, client, user, tweetLink);
        }
    }
};

/**
 * Ensures that a tweet is related to a missing person
 * @param tweet         the tweet object
 * @returns {boolean}   true if it should be processed by TellFinder, false otherwise
 */
const getMissing = (tweet) => {
    const keywords = ['missing','mssng','last seen','l/s'];
    const text = getText(tweet);
    const lowerTweet = text.toLowerCase();
    return keywords
        .filter((keyword) => lowerTweet.indexOf(keyword) !== -1)
        .length > 0;
};

/**
 * Gets the text from a tweet object
 * @param tweet     the tweet instance
 * @return {string} the string of the full text, null if tweet is null
 */
const getText = (tweet) => {
    let text = null;
    if (tweet) {
        if (tweet.extended_tweet) {
            text = tweet.extended_tweet.full_text;
        } else {
            text = tweet.full_text ? tweet.full_text : tweet.text;
        }
    }
    return text;
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
 * Checks if a tweet is from someone we are following
 * @param tweet         the tweet instance
 * @param client        the twitter client instance
 * @return {Promise}    promise resolving to the tweet if we follow the user, null otherwise
 */
const isFromFollower = (tweet,client) => {
    return new Promise(async (resolve) => {
        let shouldProcess = !isRetweet(tweet);

        // Process the tweet on if we're following the account that tweeted it
        try {
            const ids = await following.getFollowing(client);

            if (ids.filter(id => id === tweet.user.id_str).length === 0) {
                shouldProcess = false;
            }

            if (shouldProcess) {
                resolve(tweet);
            }
            resolve(null);
        } catch (err) {
            resolve(null);
        }
    });
};

/**
 * Checks if an image url is supported for reverse image search
 * @param imageUrl      the url to the image
 * @return {boolean}    true if the imageUrl is supported, false otherwise
 */
const isSupportedImageType = (imageUrl) => {
    let supported = false;
    supportedImageTypes.forEach(type => supported |= imageUrl.endsWith(type));
    return supported;
};

/**
 * Get an array of images from the tweet object.  If the tweet has embedded media, use those.  If the tweet has links,
 * download the source and return all images contained on the linked webpages.
 *
 * @param tweet         the tweet instance
 * @returns {Promise}     an array of image urls
 */
const getImages = (tweet) => {
    return new Promise(async (resolve,reject) => {

        const imagesSet = new Set();

        // If the tweet has images embedded, pull them out here
        let embeddedImages = tweet.extended_entities && tweet.extended_entities.media || [];
        embeddedImages
            .map(media => media.media_url)
            .filter(isSupportedImageType)
            .forEach(imgUrl => imagesSet.add(imgUrl));

        // Get any urls from the tweet text
        const rawUrls = tweet.entities.urls
            .map(twitterUrl => URL.parse(twitterUrl.expanded_url));

        if (rawUrls.length > 0) {

            // Run them through a un-shortener as sometimes people like to shorten links multiple times
            let urls = await unshorten.expand(rawUrls);

            // Get the images from each url and add them to the set
            for (let i = 0; i < urls.length; i++) {
                const imgUrls = await getImagesFromWebsite(urls[i]);
                imgUrls.forEach(imgUrl => imagesSet.add(imgUrl));
            }
        }
        resolve([...imagesSet]);
    });
};

/**
 * Downloads the source of a webpage and returns an array of all images contained in it
 * @param url           a node URL object to read
 * @return {Promise}    promise resolving to image urls from the website
 */
const getImagesFromWebsite = async (url) => {

    return new Promise(async (resolve,reject) => {

        try {

            // Fetch the content from the web
            let response = null;
            try {
                response = await splash.download(url.href);
            } catch (ignored) {}

            if (response == null) {
                try {
                    let rpResponse = await rp(url.href);
                    response = {
                        html : rpResponse,
                        url : url.href
                    };
                }
                catch (ignored) {}
            }

            if (response == null) {
                resolve([]);
                return;
            }

            // Run through readability to get main article content
            const article = await readability.read(response.html);
            const realUrl = URL.parse(response.url);

            // Extract images from the main content if it was extracted by readability
            const imageUrls = extractImages(article.content ? article.content : article.html)
                .map(imgUrl => realUrl.resolve(imgUrl));

            if (imageUrls.length > 0) {
                console.log(`Extracted ${imageUrls.length} images from ${url.href} : ${imageUrls}`);
            }
            resolve(imageUrls);

        } catch (err) {
            resolve([]);
        }
    });
};

/**
 * Extract all image urls from an HTML snippet
 * @param html      an html snippit as a string
 * @return {Array}  an array of image url contained in img tags in the html
 */
const extractImages = (html) => {
    const $ = cheerio.load(html);
    let imageUrls = [];
    $('img').each((i, element) => {
        const src = $(element).attr('src');
        imageUrls.push(src);
    });
    return imageUrls;
};