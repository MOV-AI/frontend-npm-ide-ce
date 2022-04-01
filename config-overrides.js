const merge = require("lodash.merge");

module.exports = function override(config, env) {
  const finalConfig = merge(config, {
    resolve: {
      alias: {
        vscode: require.resolve(
          "@codingame/monaco-languageclient/lib/vscode-compatibility"
        )
      },
      extensions: [".js", ".json", ".ttf"]
    }
  });

  finalConfig.entry = {
    main: finalConfig.entry,
    "editor.worker": "monaco-editor-core/esm/vs/editor/editor.worker.js"
  };

  finalConfig.output.filename = "[name].bundle.js";

  return finalConfig;
};
