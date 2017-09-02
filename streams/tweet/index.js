(function() {
   getById = (id,client) => {
       return new Promise((resolve,reject) => {
           client.get('statuses/show', {
               id:id,
               tweet_mode: 'extended'
           })
            .then(response => resolve(response))
            .catch(err => reject(err));
       });
   };

   module.exports.getById = getById;
})();