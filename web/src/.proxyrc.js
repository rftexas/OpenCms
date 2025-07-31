const target = process.env.NODE_ENV !== 'production'
    ? 'https://localhost:5001'
    : 'http://api:80';

module.exports = {
    '/api/*': {
        target: "https://localhost:5001",
        secure: false,
        changeOrigin: true,
        logLevel: 'debug'
    }
};