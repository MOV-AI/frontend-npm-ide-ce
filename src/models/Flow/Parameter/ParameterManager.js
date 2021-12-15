import Parameter from "./Parameter";

class Parameters {
  parameters = new Map();

  checkExists(name) {
    return this.parameters.has(name);
  }

  getParameter(name) {
    return this.parameters.get(name);
  }

  setParameter({ name, content }) {
    if (this.checkExists(name)) {
      throw new Error("Parameter already exists");
    }

    // create instance
    const obj = new Parameter();

    // populate instance
    obj.setData({ name, ...content });

    // add instance to the nodes
    this.parameters.set(name, obj);

    return this;
  }

  updateParameter({ name, content }) {
    return this.getParameter(name)?.setData(content);
  }

  deleteParameter(name) {
    this.getParameter(name)?.destroy();
    return this.parameters.delete(name);
  }

  setData(json) {
    Object.entries(json ?? {}).forEach(([name, content]) => {
      this.setParameter({ name, content });
    });
  }

  serialize() {
    const output = {};

    for (const key of this.parameters.keys()) {
      const obj = this.getParameter(key);

      output[obj.getName()] = obj.serialize();
    }

    return output;
  }

  serializeToDB() {
    const output = {};

    for (const key of this.parameters.keys()) {
      const obj = this.getParameter(key);

      output[obj.getName()] = obj.serializeToDB();
    }

    return output;
  }

  static serializeOfDB(json) {
    const output = {};

    Object.entries(json ?? {}).forEach(([name, content]) => {
      output[name] = Parameter.serializeOfDB({ [name]: { ...content } });
    });

    return output;
  }

  destroy() {
    Array.from(this.parameters.values()).destroy();
    this.parameters.clear();
  }
}

export default Parameters;
