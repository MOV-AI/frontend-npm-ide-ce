const symbols = {
  plugins: Symbol
};

/**
 * Class to manage plugins
 */
class StorePluginManager {
  constructor(plugins) {
    this.initPlugins(plugins);
  }

  get plugins() {
    return this[symbols.plugins];
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  initPlugins(plugins = []) {
    this[symbols.plugins] = new Map();

    plugins.forEach(plugin => {
      const instance = new plugin(this);
      console.log(
        `${this.constructor.name} initialized plugin ${instance.constructor.name}`
      );

      this[symbols.plugins].set(instance.constructor.name, instance);
    });
  }

  destroy() {
    for (const i of this.plugins.values()) {
      i.destroy();
    }
  }
}

export default StorePluginManager;
