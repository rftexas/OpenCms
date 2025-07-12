const target = process.env.NODE_ENV === 'production'
    ? 'https://api.yourapp.com'
    : 'https://localhost:3001/api/';

module.exports = {
    '/api/*': {
        target,
        secure: false,
        changeOrigin: true,
        logLevel: 'debug'
    }
};