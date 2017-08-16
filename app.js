const http = require('http');

const Twitter = require('twitter');
const env = require('dotenv').config();

const filter = require('./streams/filters');
const error = require('./streams/error');

const conn = {
    consumer_key: env.parsed.consumer_key,
    consumer_secret: env.parsed.consumer_secret,
    access_token_key: env.parsed.access_token_key,
    access_token_secret: env.parsed.access_token_secret
};

const client = new Twitter(conn);
const startStream = (client, streamParams) => { 
    client.stream('statuses/filter', streamParams, (stream) => {
        stream.on('data', (tweet) => filter.streamFilter(tweet, client));
        stream.on('error', error.streamError);
    });
};

client.get('friends/list', (error, friends, response) => {
    if(error) throw error;
    const streamParameters = {
        follow: friends.users.map(friend => friend.id_str).toString()
    };
    startStream(client, streamParameters);
});

// Load the http module to create an http server.

// // Configure our HTTP server to respond with Hello World to all requests.
const server = http.createServer((request, response) => {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("Up\n");
});

server.listen(env.parsed.server_listen_port);