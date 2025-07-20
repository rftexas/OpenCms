const target = process.env.NODE_ENV === 'production'
    ? 'http://localhost:5000'
    : 'http://api:80';

module.exports = {
    '/api/*': {
        target,
        secure: false,
        changeOrigin: true,
        logLevel: 'debug'
    }
};