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
      throw new Error("Node already exists");
    }

    // create instance
    const obj = new SubFlow();

    // populate instance
    obj.setData({ name, ...content });

    // add instance to the nodes
    this.data.set(name, obj);

    return this;
  }

  updateSubFlow({ name, content }) {
    return this.getSubFlow(name)?.setData(content);
  }

  deleteSubFlow(name) {
    this.getSubFlow(name)?.destroy();
    return this.data.delete(name);
  }

  setData(json) {
    Object.entries(json ?? {}).forEach(([name, content]) => {
      this.setSubFlow({ name, content });
    });
  }

  serialize() {
    const output = {};

    for (const key of this.data.keys()) {
      const obj = this.getSubFlow(key);

      output[obj.getName()] = obj.serialize();
    }

    return output;
  }

  serializeToDB() {
    const output = {};

    for (const key of this.data.keys()) {
      const obj = this.getSubFlow(key);

      output[obj.getName()] = obj.serializeToDB();
    }

    return output;
  }

  static serializeOfDB(json) {
    const output = {};

    Object.entries(json ?? {}).forEach(([name, content]) => {
      output[name] = SubFlow.serializeOfDB(content);
    });

    return output;
  }

  destroy() {
    Array.from(this.data.values()).destroy();
    this.data.clear();
  }
}

export default SubFlows;
