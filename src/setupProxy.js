const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware(
      [
        "/token-auth/**",
        "/api/**",
        "/token-verify/**",
        "/token-refresh/**",
        "/domain/**",
        "/ws/**",
        "/static/maps/**",
        "/static/meshes/**",
        "/static/point_clouds/**"
      ],
      {
        target: "https://localhost",
        ws: true,
        logLevel: "debug",
        secure: false
      }
    )
  );
};
