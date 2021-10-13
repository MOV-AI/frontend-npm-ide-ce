import { Engine, PluginManager } from "@remixproject/engine";

export default class PluginManagerIDE {
  constructor() {
    if (PluginManagerIDE.instance) return PluginManagerIDE.instance;
    PluginManagerIDE.instance = this;
    this.engine = new Engine();
    this.manager = new PluginManager();
    this.install("manager", this.manager);
    window.engine = this.engine;
    window.manager = this.manager;
  }

  register(plugin) {
    this.engine.register(plugin);
  }

  async activatePlugin(pluginName) {
    await this.manager.activatePlugin(pluginName);
  }

  async install(pluginName, plugin) {
    if (!this.engine.isRegistered(pluginName)) {
      this.engine.register(plugin);
    }
    await this.manager.activatePlugin(pluginName);
  }

  static getInstance() {
    return new PluginManagerIDE();
  }

  /**
   *
   * @param {String} pluginName
   * @param {Plugin} plugin
   */
  static async install(pluginName, plugin) {
    await PluginManagerIDE.getInstance().install(pluginName, plugin);
  }
}
