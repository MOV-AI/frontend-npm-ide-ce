import SubFlow from "./SubFlow";

class SubFlows {
  data = new Map();

  checkExists(name) {
    return this.data.has(name);
  }

  getSubFlow(name) {
    return this.data.get(name);
  }

  setSubFlow({ name, content }) {
    if (this.checkExists(name)) {
      throw new Error("Flow already exists");
    }

    // create the node
    const obj = new SubFlow();
    // populate the node
    obj.setData(SubFlow.serializeOfDB(content));

    // add instance to the nodes
    this.data.set(name, obj);

    return this;
  }

  deleteFlow(name) {
    this.getNode(name)?.destroy();
    return this.data.delete(name);
  }

  destroy() {
    Array.from(this.data.values()).destroy();
    this.data.clear();
  }
}

export default SubFlows;
