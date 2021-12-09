/**
 * Class providing a Plugin interface
 */
class StoreAbstractPlugin {
  destroy() {
    throw new Error(
      `Destroy method of the plugin ${this.constructor.name} not implemented.`
    );
  }
}

export default StoreAbstractPlugin;
