const Twitter = require('twitter');
const env = require('dotenv').config();

const filter = require('./streams/filters');
const error = require('./streams/error');

const conn = {
    consumer_key: env.parsed.consumer_key,
    consumer_secret: env.parsed.consumer_secret,
    access_token_key: env.parsed.access_token_key,
    access_token_secret: env.parsed.access_token_secret
}

const client = new Twitter(conn);
const startStream = (client, streamParams) => { 
    client.stream('statuses/filter', streamParams, (stream) => {
        stream.on('data', (tweet) => filter.streamFilter(tweet, client));
        stream.on('error', error.streamError);
    });
}

client.get('friends/list', (error, friends, response) => {
    if(error) throw error;
    const streamParameters = {
        follow: friends.users.map(friend => friend.id_str).toString()
    };
    startStream(client, streamParameters);
});
