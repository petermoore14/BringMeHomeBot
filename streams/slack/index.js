(function() {
    const IncomingWebhook = require('@slack/client').IncomingWebhook;

    const _identity = {
        send : () => { }
    };

    const searchWebhook = process.env.slackSearchUrl ? new IncomingWebhook(process.env.slackSearchUrl) : _identity;
    const logWebhook = process.env.slackLogUrl ? new IncomingWebhook(process.env.slackLogUrl) : _identity;
    const hitWebhook = process.env.slackHitUrl ? new IncomingWebhook(process.env.slackHitUrl) : _identity;
    const imageWebhook = process.env.slackImageUrl ? new IncomingWebhook(process.env.slackImageUrl) : _identity;

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

    let image = (msg) => {
        imageWebhook.send(msg,_handleResponse);
    };

    module.exports.log = log;
    module.exports.search = search;
    module.exports.hit = hit;
    module.exports.image = image;
})();