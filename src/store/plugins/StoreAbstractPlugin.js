/**
 * Class providing a Plugin interface
 */
class StoreAbstractPlugin {
  destroy() {
    throw new Error(`Destroy method of the plugin not implemented.`);
  }

  name;

  getName() {
    if (!this.name) throw new Error("Plugin name must be defined");
    return this.name;
  }
}

export default StoreAbstractPlugin;
