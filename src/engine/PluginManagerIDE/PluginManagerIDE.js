import { Engine, PluginManager } from "@remixproject/engine";

export default class PluginManagerIDE {
  constructor() {
    if (PluginManagerIDE.instance) return PluginManagerIDE.instance;
    PluginManagerIDE.instance = this;
    this.engine = new Engine();
    this.manager = new PluginManager();
    this.topics = {};
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
    // Iterate through registered topics and add newly installed plugin to list
    Object.values(this.topics).forEach(pluginTopics => {
      const _plugin = pluginTopics.plugin;
      const _topics = pluginTopics.topics;
      Object.keys(_topics).forEach(topicName => {
        _plugin.on(pluginName, topicName, _topics[topicName]);
      });
    });
  }

  /**
   * Add a subscriber to plugin, listening for emits in the specific topic name
   * @param {String} name : Name of the topic
   * @param {ViewReactPlugin} plugin : Plugin to add subscriber
   * @param {Function} lambda : Function to be called on topic emitted
   */
  addTopic(name, plugin, lambda) {
    const pluginTopics = this.topics[plugin.profile.name] ?? { topics: {} };
    pluginTopics.plugin = plugin;
    pluginTopics.topics = { ...pluginTopics.topics, [name]: lambda };
    this.topics[plugin.profile.name] = pluginTopics;
  }

  /**
   * Remove subscriber to topic
   * @param {String} name : Name of the topic
   * @param {ViewReactPlugin} plugin : Plugin to remove subscriber
   */
  removeTopic(name, plugin) {
    const pluginTopics = this.topics[plugin.profile.name];
    delete pluginTopics.topics[name];
  }

  /**
   * Get manager topics subscribed
   * @returns {Object} topics
   */
  getTopics() {
    return this.topics;
  }

  getPlugin(pluginName) {
    return this.engine?.plugins?.[pluginName];
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

  static getPlugin(pluginName) {
    return PluginManagerIDE.getInstance().getPlugin(pluginName);
  }
}
