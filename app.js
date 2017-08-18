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


console.log('Application started');
const client = new Twitter(conn);

client.get('application/rate_limit_status', (err,response) => {
    console.log(JSON.stringify(response));
    if (err) console.log(JSON.stringify(err));
});

console.log('Created connection to Twitter api');

const startStream = (client, streamParams) => { 
    client.stream('statuses/filter', streamParams, (stream) => {
        stream.on('data', (tweet) => filter.streamFilter(tweet, client));
        stream.on('error', error.streamError);
    });
};

client.get('friends/list', (error, friends, response) => {
    if(error) {
        console.log(error);
    }
    const following = friends.users.map(friend => friend.id_str).toString();
    const friendlyFollowers = friends.users.map(friend => friend.name).toString()
    console.log('Following:' + friendlyFollowers);

    const streamParameters = {
        follow: following
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