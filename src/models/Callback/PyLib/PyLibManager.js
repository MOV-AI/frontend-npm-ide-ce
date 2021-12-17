import PyLib from "./PyLib";

const EVENTS = {
  UPDATE: "onUpdate",
  CREATE: "onCreate",
  DELETE: "onDelete",
  ANY: "onAny"
};

class PyLibManager {
  constructor(name, events) {
    // events {object} : {<event name>: <callback>}
    // available events:
    // setPyLib -> onCreate
    // updatePyLib -> onUpdate
    // deletePyLib -> onDelete
    this.events = events ?? {};
    this.name = name;
  }
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

    this.emit(EVENTS.CREATE);
  }

  updatePyLib({ name, content }) {
    const res = this.getPyLib(name)?.setData(content);

    this.emit(EVENTS.UPDATE);

    return res;
  }

  deletePyLib(name) {
    this.getPyLib(name)?.destroy();
    const res = this.pylibs.delete(name);

    this.emit(EVENTS.DELETE);

    return res;
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

  emit(event) {
    const { name } = this;
    const value = this.serialize();

    // Execute on specific event
    const fn = this.events[event];

    if (typeof fn === "function") {
      fn.call(this, event, name, value);
    }

    // Execute for any of the events
    const anyFn = this.events[EVENTS.ANY];

    if (typeof anyFn === "function") {
      anyFn.call(this, event, name, value);
    }
  }

  destroy() {
    Array.from(this.pylibs.values()).destroy();
    this.pylibs.clear();
  }
}

export default PyLibManager;
