const messages = require('../messages');

//todo hook into tellfinder face matching api
module.exports.callFaceApi = (tweetInfo, tweetClient) => {
    //call facematching api
    if(false) { // if we get a direct match 
        params = {
            user_id: tweetInfo.user_id,
            text: `We have found a linked match to your missing persons ${tweetInfo.img}`
        }
        mesages.sendMessage(tweetClient, params);
    } else {
        console.log('ERROR: could not match image or bad values sent to tellfinder')
    }
}