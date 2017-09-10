(function() {

   getById = (id,client) => {
       return client.get('statuses/show', {
           id:id,
           tweet_mode: 'extended'
       });
   };

   module.exports.getById = getById;
})();