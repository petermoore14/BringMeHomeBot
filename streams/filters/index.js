const chalk = require('chalk');

module.exports.streamFilter  = (tweet) => {
    if(getMissing(tweet)){
        const img = getImage(chalk.orange(tweet));
        if(img && checkIsImage(img)){
            console.log('we have a missing and an image, call tell api func here')
        } else {
            console.log(chalk.orange('ERROR: no image'));
        }
    }
};

const getMissing = (tweet) => {
  return tweet.text.includes('MISSING:');
}

const getImage = (tweet) => {
  return tweet.extended_entities && tweet.extended_entities.media && tweet.extended_entities.medi.media_url;
}

const checkIsImage = (url) => {
    if(url.endsWith('.jpg') || url.endsWith('.png')) {
        return true;
    }
    return false;
}