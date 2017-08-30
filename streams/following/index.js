(function() {
    let following = null;

    updateFollowing = (client) => {
        return new Promise((resolve,reject) => {
            client.get('friends/ids', {stringify_ids: true}, (error, response) => {
                if(error) {
                    console.log(error);
                    reject(error);
                }
                following = response.ids;
                resolve(following);
            });
        });
    };

    getFollowing = (client) => {
      if (following === null){
          return updateFollowing(client)
      }
      return Promise.resolve(following);
    };

    module.exports.getFollowing = getFollowing;
    module.exports.updateFollowing = updateFollowing;
})();