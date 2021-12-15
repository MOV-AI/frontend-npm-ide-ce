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
    obj.setData({ name, ...content });

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

  setData(json) {
    Object.entries(json ?? {}).forEach(([name, content]) => {
      this.setLayer({ name, content });
    });
  }

  serialize() {
    const output = {};

    for (const key of this.layers.keys()) {
      const obj = this.getLayer(key);

      output[obj.getName()] = obj.serialize();
    }

    return output;
  }

  serializeToDB() {
    const output = {};

    for (const key of this.layers.keys()) {
      const obj = this.getLayer(key);

      output[obj.getId()] = obj.serializeToDB();
    }

    return output;
  }

  static serializeOfDB(json) {
    const output = {};

    Object.entries(json ?? {}).forEach(([name, content]) => {
      output[name] = Layer.serializeOfDB({ [name]: { ...content } });
    });

    return output;
  }

  destroy() {
    Array.from(this.layers.values()).destroy();
    this.layers.clear();
  }
}

export default LayerManager;
