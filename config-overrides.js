const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const packageJson = require("./package.json");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// module.exports = function override(config, env) {
//   //do stuff with the webpack config...
//   const extendedConfig = {
//     ...config,
//     plugins: [
//       ...config.plugins,
//       new ModuleFederationPlugin({
//         name: "ideCE",
//         filename: "remoteEntry.js",
//         exposes: {
//           "./Main": `./src/index`
//         }
//       }),
//       new HtmlWebpackPlugin({
//         template: "./public/index.html",
//       }),
//     ]
//     // output: {
//     //   publicPath: "/static/mov-fe-app-ide-ce/static/js"
//     // }
//   };
//   console.log("extendedConfig: ", extendedConfig);
//   return extendedConfig;
// };

module.exports = {
  // The Webpack config to use when compiling your react app for development or production.
  webpack: function (config, env) {
    // ...add your webpack config
    return {
      ...config,
      plugins: [
        ...config.plugins,
        new ModuleFederationPlugin({
          name: "ideCE",
          filename: "remoteEntry.js",
          exposes: {
            "./Main": `./src/index`
          }
        }),
        new HtmlWebpackPlugin({
          template: "./public/index.html"
        })
      ],
      output: {
        publicPath: "auto"
      }
    };
  },
  // The Jest config to use when running your jest tests - note that the normal rewires do not
  // work here.
  jest: function (config) {
    return config;
  },
  // The function to use to create a webpack dev server configuration when running the development
  // server with 'npm run start' or 'yarn start'.
  // Example: set the dev server to use a specific certificate in https.
  devServer: function (configFunction) {
    // Return the replacement function for create-react-app to use to generate the Webpack
    // Development Server config. "configFunction" is the function that would normally have
    // been used to generate the Webpack Development server config - you can use it to create
    // a starting configuration to then modify instead of having to create a config from scratch.
    return function (proxy, allowedHost) {
      // Create the default config by calling configFunction with the proxy/allowedHost parameters
      const config = configFunction(proxy, allowedHost);
      console.log("devServer: ", config);
      config.proxy = {
        "/": {
          target: "http://localhost:80",
          router: () => "http://localhost:5000",
          logLevel: "debug" /*optional*/
        }
      };
      config.port = 8081;
      // Return your customised Webpack Development Server config.
      return config;
    };
  },
  // The paths config to use when compiling your react app for development or production.
  paths: function (paths, env) {
    // ...add your paths config
    return paths;
  }
};
