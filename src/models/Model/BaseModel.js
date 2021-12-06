import Observable from "./Observable";

/**
 * Abstract class of a Model
 */
export default class Model extends Observable {
  constructor({ id, name, version, workspace = "global" }) {
    super();
    this.id = id || name;
    this.name = name;
    this.version = version;
    this.workspace = workspace;
  }

  details = { user: "N/A", date: "N/A" };
  isNew = true;
  isLoaded = false;
  isDirty = false;

  observables = ["name", "details"];

  getId() {
    return this.id;
  }

  getWorkspace() {
    return this.workspace;
  }

  getUrl() {
    return `${this.getWorkspace()}/${this.getScope()}/${this.getName()}`;
  }

  getName() {
    return this.name;
  }

  setName(value) {
    this.name = value;
    return this;
  }

  getVersion() {
    return this.version;
  }

  getDetails() {
    return this.details;
  }

  setDetails(value) {
    this.details = value;
    return this;
  }

  getIsLoaded() {
    return this.isLoaded;
  }

  setIsLoaded(value) {
    this.isLoaded = Boolean(value);
    return this;
  }

  getDirty() {
    return this.isDirty;
  }

  setDirty(value) {
    this.isDirty = Boolean(value);
    return this;
  }

  getIsNew() {
    return this.isNew;
  }

  setIsNew(value) {
    this.isNew = Boolean(value);
    return this;
  }

  dispatch(prop, value, callbacks) {
    this.setDirty(true);

    try {
      for (const fn of callbacks) {
        setTimeout(() => fn.call(this, prop, value), 0);
      }
    } catch (error) {
      console.error(error);
    }
  }

  setData(json) {
    Object.entries(json).forEach(([key, value]) => {
      if (Reflect.has(this, key) && value !== undefined) {
        Reflect.set(this, key, value);
      }
    });
    return this;
  }

  destroy() {
    super.destroy();
  }

  /**
   * Methods to be implemented in the extended class
   */
  getScope() {
    return "NA";
  }

  serialize() {
    return {
      id: this.getId(),
      name: this.getName(),
      workspace: this.getWorkspace(),
      details: this.getDetails(),
      version: this.getVersion()
    };
  }

  serializeToDB() {
    return this.serialize();
  }

  getFileExtension() {
    return ".NA";
  }

  static ofJSON(json) {
    const { id, name, workspace, version, ...others } = json;

    return new this({ id, name, workspace, version })
      .setData({ ...others })
      .setDirty(false)
      .setIsNew(false);
  }
}
