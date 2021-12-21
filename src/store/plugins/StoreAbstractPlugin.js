/**
 * Class providing a Plugin interface
 */
class StoreAbstractPlugin {
  name;

  getName() {
    if (!this.name) throw new Error("Plugin name must be defined");
    return this.name;
  }

  destroy() {
    throw new Error(`Destroy method of the plugin not implemented.`);
  }
}

export default StoreAbstractPlugin;
