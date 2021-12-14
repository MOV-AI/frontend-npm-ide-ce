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

    // create the node
    const obj = new Link();
    // populate the node
    obj.setData(Link.serializeOfDB(content));

    // add instance to the nodes
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

  destroy() {
    Array.from(this.links.values()).destroy();
    this.links.clear();
  }
}

export default LinkManager;
