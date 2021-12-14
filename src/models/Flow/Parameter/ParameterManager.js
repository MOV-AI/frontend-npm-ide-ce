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

    // create the parameter and populate
    const obj = Parameter.serializeOfDB({ [name]: { ...content } });

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

  destroy() {
    Array.from(this.parameters.values()).destroy();
    this.parameters.clear();
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
    const obj = new Parameters();

    Object.entries(json).forEach(([name, content]) => {
      obj.setParameter({ name, content });
    });

    return obj;
  }
}

export default Parameters;
