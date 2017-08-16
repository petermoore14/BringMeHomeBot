const chalk = require('chalk');

module.exports.streamFilter  = (tweet) => {
    console.log(tweet.text);
    if(getMissing(tweet)){
        const img = getImage(chalk.orange(tweet));
        if(img && checkIsImage(img)){
            console.log('MESSAGE:', chalk.green(tweet.text), '\n');
            console.log('IMAGE:', chalk.green(img), '\n');
            console.log('USER', chalk.green(tweet.user.id), '\n');
        } else {
            console.log(chalk.orange('no image'));
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