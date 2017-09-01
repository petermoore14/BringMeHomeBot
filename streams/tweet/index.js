(function() {
   getById = (id,client) => {
       return new Promise((resolve,reject) => {
           client.get('statuses/show', {id})
               .then(response => resolve(response))
               .catch(err => reject(err));
       });
   };

   module.exports.getById = getById;
})();