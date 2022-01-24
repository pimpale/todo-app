const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8079',
      changeOrigin: true,
      pathRewrite: {
        '^/api/auth': '/public', // rewrite path
      },
    })
  );
  app.use(
    '/api/todo_app',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api/todo_app': '/public', // rewrite path
      },
    })
  );
};
