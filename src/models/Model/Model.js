export default class Model {
  id; // unique identifier
  details; // model details
  constructor({ id, details = { user: "", lastUpdate: "" } }) {
    this.id = id;
    this.details = details;
  }

  getId() {
    return this.id;
  }

  setId(id) {
    this.id = id;
  }

  getDetails() {
    return this.details;
  }

  setDetails(details) {
    this.details = details;
  }

  /**
   * Updates model in DB
   * @returns {Model}
   */
  save() {
    // save in DB
    return this;
  }

  /**
   * @param {Model => {}} callback
   * @returns {Model}
   */
  subscribe(callback) {
    // subscribe
    return this;
  }
}
