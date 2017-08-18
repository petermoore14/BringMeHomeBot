const chalk = require('chalk');
const callTellfinder = require('../tell-api')
const env = require('dotenv').config();
module.exports.streamFilter  = (tweet, client) => {
    console.log("Recieved tweet: " + tweet.text);
    if(getMissing(tweet)){
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