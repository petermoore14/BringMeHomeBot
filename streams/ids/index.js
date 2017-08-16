module.exports.streamIDs =  [
    {
        name: 'Toronto Police OPSVerified account',
        id: '463933187'
    },
    {
        name: 'Toronto Police',
        id: '16295454'
    }
];

module.exports.getStreamIds = (ids) => {
    return ids.map(acc => acc.id).toString();
}

