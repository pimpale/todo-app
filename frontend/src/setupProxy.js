const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: 'http://localhost:8079',
      changeOrigin: true,
      pathRewrite: {
        '^/api/auth': '/public', // rewrite path
      },
    })
  );
  app.use(
    '/api/todo_app',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api/todo_app': '/public', // rewrite path
      },
    })
  );
};
