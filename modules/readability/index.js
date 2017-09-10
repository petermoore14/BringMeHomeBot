(function() {
    const read = require('node-readability');

    /**
     * Wrap readability in a promise
     * @param html          the html to process
     * @return {Promise}    promise resolving to the article returned from readability
     */
    module.exports.read = (html) => {
        return new Promise((resolve,reject) => {
            read(html,(err,article) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(article);
                }
            });
        });
    }
})();