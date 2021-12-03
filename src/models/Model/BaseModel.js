/**
 * Abstract class of a Model
 */
export default class Model {
  name;
  details; // model details
  constructor({
    name = null,
    details = { user: "N/A", date: "N/A" },
    workspace = "global"
  }) {
    this.name = name;
    this.details = details;
    this.workspace = workspace;
    this.isNew = false;
    this.isLoaded = false;
    this.isDirty = false;

    // methods to decorate with the decorator
    this.toDecorate = [];
    this.decorator = this.withSetDirty;

    return new Proxy(this, {
      get(target, prop, receiver) {
        if (target.toDecorate.includes(prop)) {
          return target.decorator(Reflect.get(...arguments));
        }
        return Reflect.get(...arguments);
      }
    });
  }

  getUrl() {
    return `${this.workspace}/${this.getScope()}/${this.getName()}`;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
    return this;
  }

  getDetails() {
    return this.details;
  }

  setDetails(details) {
    this.details = details;
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

  withSetDirty(fn) {
    return function () {
      this.setDirty(true);
      return fn.call(this, ...arguments);
    };
  }

  getIsNew() {
    return this.isNew;
  }

  setIsNew(value) {
    this.isNew = Boolean(value);
    return this;
  }

  /**
   * Methods to be implemented in the extended class
   */
  getScope() {
    return "NA";
  }

  serialize() {
    return {};
  }

  getFileExtension() {
    return ".NA";
  }

  destroy() {
    // TODO: cleanup the instance
  }
}
