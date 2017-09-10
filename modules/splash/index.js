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
     * @return {Promise}    promise resolving to the downloaded HTML
     */
    let download = (url) => {
        return new Promise( async (resolve,reject) => {
            const options = {
                method: 'GET',
                uri: `${splashBaseUrl}?url=${encodeURIComponent(url)}&resource_timeout=${splashTimeout}&wait=${splashWait}&html=1`,
                headers: {'Authorization': splashBasic}
            };
            try {
                const r = await rp(options);
                resolve(JSON.parse(r));
            } catch (err) {
                reject(err);
            }

        });
    };

    module.exports.download = download;
})();