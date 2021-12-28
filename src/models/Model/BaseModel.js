import Observable from "./Observable";

/**
 * Abstract class of a Model
 */
export default class Model extends Observable {
  constructor({ id, name, version, workspace = "global" }) {
    super();
    this.id = id ?? name;
    this.name = name;
    this.version = version;
    this.workspace = workspace;

    this.enableObservables();
  }

  details = { user: "N/A", date: "N/A" };
  isNew = true;
  isLoaded = false;
  isDirty = true;
  isOutdated = false;

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

  getOutdated() {
    return this.isOutdated;
  }

  setOutdated(value) {
    this.isOutdated = value;
    return this;
  }

  dispatch() {
    this.setDirty(true);

    super.dispatch(...arguments);
  }

  setData(json) {
    Object.entries(json ?? {}).forEach(([key, value]) => {
      if (Reflect.has(this, key) && value !== undefined) {
        Reflect.set(this, key, value);
      }
    });
    this.setOutdated(false);
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

  getFileExtension() {
    return ".NA";
  }

  serialize() {
    return {
      id: this.getId(),
      url: this.getUrl(),
      name: this.getName(),
      scope: this.getScope(),
      workspace: this.getWorkspace(),
      details: this.getDetails(),
      version: this.getVersion()
    };
  }

  serializeToDB() {
    return this.serialize();
  }

  static serializeOfDB(args) {
    return args;
  }

  static ofJSON(json) {
    const data = this.serializeOfDB(json);

    const obj = new this(data);

    return obj.setData(data).setDirty(false);
  }
}
