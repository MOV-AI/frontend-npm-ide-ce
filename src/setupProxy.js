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
        "/lsp/languageServer/**"
      ],
      {
        target: "https://localhost:8083",
        ws: true,
        logLevel: "debug",
        secure: false
      }
    )
  );
};
