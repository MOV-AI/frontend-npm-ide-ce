const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const nodeExternals = require('webpack-node-externals');
const path = require("path");

module.exports = function override(config, env) {
  // Add alias to vscode
  config.resolve.alias.vscode = require.resolve(
    "@codingame/monaco-languageclient/lib/vscode-compatibility"
  );
  // target
  config.target = "web";
  config.entry = "./src/index.js"
  // Add plugins
  config.plugins = [...config.plugins, new MonacoWebpackPlugin()];
  config.externals = [nodeExternals({importType: "umd"})]
  config.output.libraryTarget = "amd";
  config.output.library = "IDE_CE";
  // Optimizations
  config.optimization =  {
    ...config.optimization,
    concatenateModules: false,
    providedExports: false,
    usedExports: false,
  }
  // Add loaders
  config.module.rules = [
    ...config.module.rules,
    {
      test: /node_modules\/monaco-editor/,
      use: {
        loader: "babel-loader",
        options: { presets: ["@babel/preset-env"] }
      }
    },
    {
      test: /.css$/,
      resolve: {
        extensions: [".css"]
      },
      use: ["style-loader", "css-loader", "postcss-loader"],
      include: [
        path.resolve(__dirname, "./node_modules/monaco-editor")
      ]
    },
    {
      test: /\.ttf$/,
      use: ['file-loader'],
    },
  ];
  // return config
  return config;
};
