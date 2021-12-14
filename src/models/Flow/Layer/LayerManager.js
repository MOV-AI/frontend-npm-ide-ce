import Layer from "./Layer";

class LayerManager {
  layers = new Map();

  checkExists(name) {
    return this.layers.has(name);
  }

  getLayer(name) {
    return this.layers.get(name);
  }

  setLayer({ name, content }) {
    if (this.checkExists(name)) {
      throw new Error("Layer already exists");
    }

    // create the node
    const obj = new Layer();
    // populate the node
    obj.setData(Layer.serializeOfDB(content));

    // add instance to the nodes
    this.layers.set(name, obj);

    return this;
  }

  updateLayer({ name, content }) {
    return this.getLayer(name)?.setData(content);
  }

  deleteLayer(name) {
    this.getLayer(name)?.destroy();
    return this.layers.delete(name);
  }

  destroy() {
    Array.from(this.layers.values()).destroy();
    this.layers.clear();
  }
}

export default LayerManager;
