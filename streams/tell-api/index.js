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