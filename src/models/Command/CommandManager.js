import Command from "./Command";

class CommandManager {
  commands = new Map();

  checkExists(name) {
    return this.commands.has(name);
  }

  getCommand(name) {
    return this.commands.get(name);
  }

  setCommand({ name, content }) {
    if (this.checkExists(name)) {
      throw new Error("Command already exists");
    }

    // create instance
    const obj = new Command();

    // populate instance
    obj.setData({ name, ...content });

    // add instance to the nodes
    this.commands.set(name, obj);

    return this;
  }

  updateCommand({ name, content }) {
    return this.getCommand(name)?.setData(content);
  }

  deleteCommand(name) {
    this.getCommand(name)?.destroy();
    return this.commands.delete(name);
  }

  setData(json) {
    Object.entries(json ?? {}).forEach(([name, content]) => {
      this.setCommand({ name, content });
    });
  }

  serialize() {
    const output = {};

    for (const key of this.commands.keys()) {
      const obj = this.getCommand(key);

      output[obj.getName()] = obj.serialize();
    }

    return output;
  }

  serializeToDB() {
    const output = {};

    for (const key of this.commands.keys()) {
      const obj = this.getCommand(key);

      output[obj.getName()] = obj.serializeToDB();
    }

    return output;
  }

  static serializeOfDB(json) {
    const output = {};

    Object.entries(json ?? {}).forEach(([name, content]) => {
      output[name] = Command.serializeOfDB({ [name]: { ...content } });
    });

    return output;
  }

  destroy() {
    Array.from(this.commands.values()).destroy();
    this.commands.clear();
  }
}

export default CommandManager;
