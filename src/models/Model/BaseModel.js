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
    this.url = `${this.workspace}/${this.getScope()}/${this.getName()}`;
    this.isNew = false;
    this.isLoaded = false;
    this.isDirty = true;
  }

  getUrl() {
    return this.url;
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

  setIsDirty(value) {
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

  /**
   * Method to be implemented in its sub-classes
   */
  getScope() {
    throw new Error("Not implemented");
  }

  serialize() {
    throw new Error("Not implemented");
  }

  validate() {
    return this.schema.validate(this.serialize());
  }
}
