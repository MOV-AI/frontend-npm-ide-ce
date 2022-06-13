const cracoModuleFederation = require("craco-module-federation");

module.exports = {
  plugins: [
    {
      plugin: cracoModuleFederation,
      options: { useNamedChunkIds: true } //THIS LINE IS OPTIONAL
    }
  ]
};
