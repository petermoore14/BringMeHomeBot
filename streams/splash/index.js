(function() {
    const rp = require('request-promise');

    const splashBaseUrl = process.env.splashBaseUrl;
    const splashTimeout = process.env.splashTimeout;
    const splashUser = process.env.splashUsername;
    const splashPassword = process.env.splashPassword;
    const splashWait = process.env.splashWait;
    const splashAuth = new Buffer(splashUser + ":" + splashPassword).toString('base64');
    const splashBasic = 'Basic ' + splashAuth;


    /**
     * Download the HTML of a website given a url
     * @param url           the url to download
     * @return {string}     the HTML of the url as a string
     */
    let download = (url) => {
        const options = {
            method: 'GET',
            uri: `${splashBaseUrl}?url=${encodeURIComponent(url)}&resource_timeout=${splashTimeout}&wait=${splashWait}&html=1`,
            headers: {'Authorization': splashBasic}
        };
        return rp(options).then(responseStr => {
            const response = JSON.parse(responseStr);
            return response;
        });
    };

    module.exports.download = download;
})();