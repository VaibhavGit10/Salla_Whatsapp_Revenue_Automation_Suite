const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to the backend AppSail server
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_TARGET || 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove /api prefix when forwarding
      },
    })
  );
};
