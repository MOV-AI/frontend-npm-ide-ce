import Link from "./Link";

class LinkManager {
  links = new Map();

  checkExists(name) {
    return this.links.has(name);
  }

  getLink(name) {
    return this.links.get(name);
  }

  setLink({ name, content }) {
    if (this.checkExists(name)) {
      throw new Error("Link already exists");
    }

    // create instance
    const obj = new Link();

    // populate instance
    obj.setData({ name, ...content });

    // add instance to the links
    this.links.set(name, obj);

    return this;
  }

  updateLink({ name, content }) {
    return this.getLink(name)?.setData(content);
  }

  deleteLink(name) {
    this.getLink(name)?.destroy();
    return this.links.delete(name);
  }

  setData(json) {
    Object.entries(json ?? {}).forEach(([name, content]) => {
      this.setLink({ name, content });
    });
  }

  serialize() {
    const output = {};

    for (const key of this.nodes.keys()) {
      const obj = this.getLink(key);

      output[obj.getName()] = obj.serialize();
    }

    return output;
  }

  serializeToDB() {
    const output = {};

    for (const key of this.links.keys()) {
      const obj = this.getLink(key);

      output[obj.getName()] = obj.serializeToDB();
    }

    return output;
  }

  static serializeOfDB(json) {
    const output = {};

    Object.entries(json ?? {}).forEach(([name, content]) => {
      output[name] = Link.serializeOfDB({ [name]: { ...content } });
    });

    return output;
  }

  destroy() {
    Array.from(this.links.values()).destroy();
    this.links.clear();
  }
}

export default LinkManager;
