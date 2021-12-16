import EnvVar from "./EnvVar";

class EnvVarManager {
  envvars = new Map();

  checkExists(name) {
    return this.envvars.has(name);
  }

  getEnvVar(name) {
    return this.envvars.get(name);
  }

  setEnvVar({ name, content }) {
    if (this.checkExists(name)) {
      throw new Error("EnvVar already exists");
    }

    // create instance
    const obj = new EnvVar();

    // populate instance
    obj.setData({ name, ...content });

    // add instance to the nodes
    this.envvars.set(name, obj);

    return this;
  }

  updateEnvVar({ name, content }) {
    return this.getEnvVar(name)?.setData(content);
  }

  deleteEnvVar(name) {
    this.getEnvVar(name)?.destroy();
    return this.envvars.delete(name);
  }

  setData(json) {
    Object.entries(json ?? {}).forEach(([name, content]) => {
      this.setEnvVar({ name, content });
    });
  }

  serialize() {
    const output = {};

    for (const key of this.envvars.keys()) {
      const obj = this.getEnvVar(key);

      output[obj.getName()] = obj.serialize();
    }

    return output;
  }

  serializeToDB() {
    const output = {};

    for (const key of this.envvars.keys()) {
      const obj = this.getEnvVar(key);

      output[obj.getName()] = obj.serializeToDB();
    }

    return output;
  }

  static serializeOfDB(json) {
    const output = {};

    Object.entries(json ?? {}).forEach(([name, content]) => {
      output[name] = EnvVar.serializeOfDB({ [name]: { ...content } });
    });

    return output;
  }

  destroy() {
    Array.from(this.envvars.values()).destroy();
    this.envvars.clear();
  }
}

export default EnvVarManager;
