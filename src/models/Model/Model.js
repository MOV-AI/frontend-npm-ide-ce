/**
 * Abstract class of a Model
 */
export default class Model {
  name;
  details; // model details
  constructor(
    name = "__placeholder__",
    details = { user: "N/A", date: "N/A" }
  ) {
    this.name = name;
    this.details = details;
    this.url = `global/${this.getScope()}/${this.name}`;
    this.isNew = true;
    this.isDirty = true;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getDetails() {
    return this.details;
  }

  setDetails(details) {
    this.details = details;
  }

  /**
   * Method to be implemented in its sub-classes
   */
  getScope() {
    return "Model";
  }
}
