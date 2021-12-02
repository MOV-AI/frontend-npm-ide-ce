/**
 * Abstract class of a Model
 */
export default class Model {
  /**
   * Should be private
   * @param {String} name
   * @param {{user: String, date: String}} details
   * @returns
   */
  constructor(
    name = "__placeholder__",
    details = { user: "N/A", date: "N/A" }
  ) {
    this.name = name;
    this.details = details;
    this.url = `global/${this.getScope()}/${this.name}`;
    this._isNew = true;
    this._isDirty = false;
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

  isDirty() {
    return this._isDirty;
  }

  isNew() {
    return this._isNew;
  }

  /**
   * Method to be implemented in its sub-classes
   */
  getScope() {
    return "Model";
  }
}
