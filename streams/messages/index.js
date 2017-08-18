const env = require('dotenv').config();
const IncomingWebhook = require('@slack/client').IncomingWebhook;

const url = env.parsed.slackUrl;
const webhook = new IncomingWebhook(url);

//params needs to be user_id || screen_name and text e.g {user_id:22123, text: 'hello'}
module.exports.sendMessage = (client, params, tweetLink) => {
    client.post('direct_messages/new', params, (err, message, res) => {
        if(!err){
            console.log('sent DM');
        }else {
            console.log('ERROR: Unable to send message after matching image');
        }
    });
    const slackMessage = `${params.text}, Link to tweet: ${tweetLink}`;
    webhook.send(slackMessage, function(err, header, statusCode, body) {
        if (err) {
          console.log('Error:', err);
        } else {
          console.log('Received', statusCode, 'from Slack');
        }
      });
}






