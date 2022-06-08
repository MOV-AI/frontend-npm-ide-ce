const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const packageJson = require("./package.json");

module.exports = function override(config, env) {
  //do stuff with the webpack config...
  const extendedConfig = {
    ...config,
    plugins: [
      ...config.plugins,
      new ModuleFederationPlugin({
        name: "ideCE",
        filename: "remoteEntry.js",
        exposes: {
          "./Main": `./src/index`
        },
        shared: packageJson.dependencies
      })
    ]
  };
  console.log("extendedConfig: ", extendedConfig);
  return extendedConfig;
};
