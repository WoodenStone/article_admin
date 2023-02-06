module.exports = process.env.NODE_ENV === 'production'
    ? require('./config.production')
    : require('./config.development')