const Twitter = require('twitter');
const env = require('dotenv').config();

const filter = require('./streams/filters');
const error = require('./streams/error');
const accounts = require('./streams/ids');

const streamParameters = {
    follow: accounts.getStreamIds(accounts.streamIDs)
};

const conn = {
    consumer_key: env.parsed.consumer_key,
    consumer_secret: env.parsed.consumer_secret,
    access_token_key: env.parsed.access_token_key,
    access_token_secret: env.parsed.access_token_secret
}

const client = new Twitter(conn);
client.stream('statuses/filter', streamParameters, (stream) => {
    stream.on('data', (tweet, client) => { 
        filter.streamFilter(tweet, client);
    });
    stream.on('error', error.streamError);
})