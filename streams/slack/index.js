(function() {
    const IncomingWebhook = require('@slack/client').IncomingWebhook;

    const searchWebhook = new IncomingWebhook(process.env.slackSearchUrl);
    const logWebhook = new IncomingWebhook(process.env.slackLogUrl);
    const hitWebhook = new IncomingWebhook(process.env.slackHitUrl);

    let _handleResponse = (err) => {
        if (err) console.log('Error:', err);
    };

    let log = (msg) => {
        logWebhook.send(msg,_handleResponse);
    };

    let search = (msg) => {
        searchWebhook.send(msg,_handleResponse);
    };

    let hit = (msg) => {
        hitWebhook.send(msg,_handleResponse);
    };

    module.exports.log = log;
    module.exports.search = search;
    module.exports.hit = hit;
})();