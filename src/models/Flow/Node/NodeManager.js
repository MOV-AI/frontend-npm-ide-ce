import Node from "./Node";

class NodeInstances {
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

    // create the node
    const obj = new Node();
    // populate the node
    obj.setData(Node.serializeOfDB(content));

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

  destroy() {
    Array.from(this.nodes.values()).destroy();
    this.nodes.clear();
  }
}

export default NodeInstances;
