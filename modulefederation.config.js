const deps = require("./package.json").dependencies;

module.exports = {
  name: "ideCE",
  exposes: {
    "./Main": "./src/index"
  },
  filename: "remoteEntry.js"
  //   shared: {
  //     ...deps,
  //     react: {
  //       singleton: true,
  //       requiredVersion: deps["react"]
  //     },
  //     "react-dom": {
  //       singleton: true,
  //       requiredVersion: deps["react-dom"]
  //     }
  //   }
};
