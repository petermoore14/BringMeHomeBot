(function() {
    const keys = process.env.apiKeys.split(',');

    /**
     * Checks if an API key is valid for BringMeHome
     * @param key           the api key to check
     * @returns {boolean}   true if the api key is valid, false otherwise
     */
    module.exports.isValidKey = (key) => {
        return key !== undefined && key !== null && keys.indexOf(key) !== -1;
    };

})();
