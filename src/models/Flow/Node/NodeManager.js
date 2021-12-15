import Node from "./Node";

class NodeManager {
  nodes = new Map();

  checkExists(name) {
    return this.nodes.has(name);
  }

  getNode(name) {
    return this.nodes.get(name);
  }

  setNode({ name, content }) {
    if (this.checkExists(name)) {
      throw new Error("Node already exists");
    }

    // create instance
    const obj = new Node();

    // populate instance
    obj.setData({ name, ...content });

    // add instance to the nodes
    this.nodes.set(name, obj);

    return this;
  }

  updateNode({ name, content }) {
    return this.getNode(name)?.setData(content);
  }

  deleteNode(name) {
    this.getNode(name)?.destroy();
    return this.nodes.delete(name);
  }

  setData(json) {
    Object.entries(json ?? {}).forEach(([name, content]) => {
      this.setNode({ name, content });
    });
  }

  serialize() {
    const output = {};

    for (const key of this.nodes.keys()) {
      const obj = this.getNode(key);

      output[obj.getName()] = obj.serialize();
    }

    return output;
  }

  serializeToDB() {
    const output = {};

    for (const key of this.nodes.keys()) {
      const obj = this.getNode(key);

      output[obj.getName()] = obj.serializeToDB();
    }

    return output;
  }

  static serializeOfDB(json) {
    const output = {};

    Object.entries(json ?? {}).forEach(([name, content]) => {
      output[name] = Node.serializeOfDB(content);
    });

    return output;
  }

  destroy() {
    Array.from(this.nodes.values()).destroy();
    this.nodes.clear();
  }
}

export default NodeManager;
