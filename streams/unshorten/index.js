(function() {
    const unhsortener = require('unshortener');
    const URL = require('url');

    const bitly = {
        username : process.env.bitlyuser,
        apikey: process.env.bitly
    };

    /**
     * Helper to recursively expand until we get the real URL
     * @param url       url input
     * @param callback  called when expanded url equals input url
     */
    const unshortenAll = (url,callback) => {
        unhsortener.expand(url, (err, expandedUrl) => {
            if (err) {
                if (expandedUrl) {
                    resolve(expandedUrl)
                }
                else {
                    resolve(url);
                }
            }

            if (expandedUrl.href == url.href) {
                callback(expandedUrl);
            } else {
                unshortenAll(expandedUrl,callback);
            }
        })
    };

    /**
     * Recursively expand urls using unshortener. Wrap it as a promise
     * @param url           the url object to unshorten
     * @return {Promise}
     */
    module.exports.expand = (url) => {
        return new Promise((resolve) => {

            // If args is an array, unshorten all of them
            if (url instanceof Array) {
                let remaining = url.length;
                const unshortened = [];
                for (let i = 0; i < url.length; i++) {
                    unshortenAll(url[i], (unshortenedUrl) => {
                        unshortened.push(unshortenedUrl);
                        remaining--;
                        if (remaining == 0) {
                            resolve(unshortened);
                        }
                    });
                }
            } else {
                unshortenAll(url,(unshortenedUrl) => {
                    resolve(unshortenedUrl);
                });
            }
        });
    }
})();