(function() {
    const unshortener = require('unshortener');

    /**
     * Wrap unshortener in a promise
     * @param url           url input
     * @return {Promise}    promise resolving to the unshortened url or the original url if it was not shortened
     */
    const unshorten = (url) => {
        return new Promise((resolve,reject) => {
            unshortener.expand(url,(err, expandedUrl) => {
                if (err) {
                    if (expandedUrl) {
                        resolve(expandedUrl)
                    }
                    else {
                        resolve(url);
                    }
                } else {
                    resolve(expandedUrl);
                }
            });
        });
    };

    /**
     * Expand a single url or an array of them
     * @param url           the url object to unshorten
     * @return {Promise}
     */
    module.exports.expand = (url) => {
        return new Promise(async (resolve) => {

            // If args is an array, unshorten all of them
            if (url instanceof Array) {
                const unshortenedPromises = url.map(async u => {
                    return await unshorten(u);
                });

                const unshortenedUrls = await Promise.all(unshortenedPromises);

                resolve(unshortenedUrls);
            } else {
                const unshortened = await unshorten(url);
                resolve(unshortened);
            }
        });
    }
})();