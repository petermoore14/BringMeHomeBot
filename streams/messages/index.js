
/*
 * Copyright 2017 Uncharted Software Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const IncomingWebhook = require('@slack/client').IncomingWebhook;

const url = process.env.slackUrl;
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
    webhook.send(slackMessage, function(err, header, statusCode) {
        if (err) {
          console.log('Error:', err);
        } else {
          console.log('Received', statusCode, 'from Slack');
        }
      });
};






