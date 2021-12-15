import PyLib from "./PyLib";

class PyLibManager {
  pylibs = new Map();

  checkExists(name) {
    return this.pylibs.has(name);
  }

  getPyLib(name) {
    return this.pylibs.get(name);
  }

  setPyLib({ name, content }) {
    if (this.checkExists(name)) {
      throw new Error("PyLib already exists");
    }

    // create instance
    const obj = new PyLib();

    // populate instance
    obj.setData({ name, ...content });

    // add instance to the nodes
    this.pylibs.set(name, obj);

    return this;
  }

  updatePyLib({ name, content }) {
    return this.getPyLib(name)?.setData(content);
  }

  deletePyLib(name) {
    this.getPyLib(name)?.destroy();
    return this.pylibs.delete(name);
  }

  setData(json) {
    Object.entries(json ?? {}).forEach(([name, content]) => {
      this.setPyLib({ name, content });
    });
  }

  serialize() {
    const output = {};

    for (const key of this.pylibs.keys()) {
      const obj = this.getPyLib(key);

      output[obj.getName()] = obj.serialize();
    }

    return output;
  }

  serializeToDB() {
    const output = {};

    for (const key of this.pylibs.keys()) {
      const obj = this.getPyLib(key);

      output[obj.getName()] = obj.serializeToDB();
    }

    return output;
  }

  static serializeOfDB(json) {
    const output = {};

    Object.entries(json ?? {}).forEach(([name, content]) => {
      output[name] = PyLib.serializeOfDB({ [name]: { ...content } });
    });

    return output;
  }

  destroy() {
    Array.from(this.pylibs.values()).destroy();
    this.pylibs.clear();
  }
}

export default PyLibManager;
