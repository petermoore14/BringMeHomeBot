
//params needs to be user_id || screen_name and text e.g {user_id:22123, text: 'hello'}
module.exports.sendMessage = (client, params) => {
    client.post('direct_messages/new', params, (err, message, res) => {
        if(!err){
            console.log(message);
        }else {
            console.log('Unable to send message after matching image');
        }
    });
}