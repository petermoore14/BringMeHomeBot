(() => {
    const rp = require('request-promise');
    const logoBase = process.env.logoUrl;
    const slack = require('../slack');

    /**
     * Returns the probability the given url is a logo/image macro/etc
     * @param url           the publicly accessible url for the image
     * @return {Promise}    resolving to a value between [0,1] that indicates the probability the image is not a photo
     */
    probability = (url) => {
        return new Promise(async (resolve) => {
            const encoded = encodeURIComponent(url);
            const requestUrl = `${logoBase}/image/logoClassifier?url=${encoded}`;

            // Classify the url as a logo.  If there is an error, assume it is a not a log
            try {
                const response = await rp(requestUrl);
                const logoProbability = JSON.parse(response).logoProbability;

                if (logoProbability > process.env.logoThreshold) {
                    slack.logos(url);
                }

                resolve(logoProbability);
            } catch (err) {
                console.log('Error:  Could not get response from logo classifier service, defaulting to "not a logo"');
                resolve(0.0);
            }
        });
    };

    /**
     * Checks if an array of image urls is all logos
     * @param urls          an array of publicly accessibly image urls
     * @return {Promise}    resolves to true if all urls are logos, false otherwise
     */
    all = (urls) => {
        return new Promise(async (resolve) => {
            let logos = 0;
            for (let i = 0; i < urls.length; i++) {
                const prob = await probability(urls[i]);
                if (prob > process.env.logoThreshold) {
                    logos++;
                }
            }
            resolve(logos === urls.length);
        });
    };

    module.exports.probability = probability;
    module.exports.all = all;
})();