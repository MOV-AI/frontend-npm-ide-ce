const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware(
      [
        "/token-auth/**",
        "/api/**",
        "/token-verify/**",
        "/token-refresh/**",
        "/domains/**",
        "/ws/**",
        "/static/maps/**",
        "/static/meshes/**",
        "/static/point_clouds/**",
        "/lsp/**"
      ],
      {
        target: "http://localhost:8080",
        ws: true,
        logLevel: "debug",
        secure: false
      }
    )
  );
};
