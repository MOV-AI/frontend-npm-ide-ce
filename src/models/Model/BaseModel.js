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

  //========================================================================================
  /*                                                                                      *
   *                                   Model Properties                                   *
   *                                                                                      */
  //========================================================================================

  details = { user: "N/A", date: "N/A" };
  isNew = true;
  isLoaded = false;
  isDirty = true;
  isOutdated = false;

  observables = ["name", "details"];

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the id property
   * @returns {string}
   */
  getId() {
    return this.id;
  }

  /**
   * Returns the workspace property
   * @returns {string}
   */
  getWorkspace() {
    return this.workspace;
  }

  /**
   * Returns the url property
   * @returns {string}
   */
  getUrl() {
    return `${this.getWorkspace()}/${this.getScope()}/${this.getName()}`;
  }

  /**
   * Returns the name property
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * Sets the new value of the property
   * @param {string} value : The new value
   * @returns {Model} : The instance
   */
  setName(value) {
    this.name = value;
    return this;
  }

  /**
   * Returns the version property
   * @returns {string}
   */
  getVersion() {
    return this.version;
  }

  /**
   * Returns the details property
   * @returns {string}
   */
  getDetails() {
    return this.details;
  }

  /**
   * Sets the new value of the property
   * @param {string} value : The new value
   * @returns {Model} : The instance
   */
  setDetails(value) {
    this.details = value;
    return this;
  }

  /**
   * Returns the isLoaded property
   * @returns {boolean}
   */
  getIsLoaded() {
    return this.isLoaded;
  }

  /**
   * Sets the new value of the property
   * @param {boolean} value : The new value
   * @returns {Model} : The instance
   */
  setIsLoaded(value) {
    this.isLoaded = Boolean(value);
    return this;
  }

  /**
   * Returns the isDirty property
   * @returns {boolean}
   */
  getDirty() {
    return this.isDirty;
  }

  /**
   * Sets the new value of the property
   * @param {boolean} value : The new value
   * @returns {Model} : The instance
   */
  setDirty(value) {
    this.isDirty = Boolean(value);
    return this;
  }

  /**
   * Returns the isNew property
   * @returns {boolean}
   */
  getIsNew() {
    return this.isNew;
  }

  /**
   * Sets the new value of the property
   * @param {boolean} value : The new value
   * @returns {Model} : The instance
   */
  setIsNew(value) {
    this.isNew = Boolean(value);
    return this;
  }

  /**
   * Returns the isOutdated property
   * @returns {boolean}
   */
  getOutdated() {
    return this.isOutdated;
  }

  /**
   * Sets the new value of the property
   * @param {boolean} value : The new value
   * @returns {Model} : The instance
   */
  setOutdated(value) {
    this.isOutdated = value;
    return this;
  }

  /**
   * Updates the properties of the instance
   * @param {object} json : The data to update the instance
   * @returns {Model} : The instance
   */
  setData(json) {
    Object.entries(json ?? {}).forEach(([key, value]) => {
      if (Reflect.has(this, key) && value !== undefined) {
        Reflect.set(this, key, value);
      }
    });
    this.setOutdated(false);
    return this;
  }

  /**
   * Returns the scope property
   * Override in the extended class
   * @returns {string}
   */
  getScope() {
    return "NA";
  }

  /**
   * Returns the fileExtension property
   * Override in the extended class
   * @returns {string}
   */
  getFileExtension() {
    return ".NA";
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Sets the object as dirty and executes the dispatcher
   */
  dispatch() {
    this.setDirty(true);

    super.dispatch(...arguments);
  }

  //========================================================================================
  /*                                                                                      *
   *                                      Serializers                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the instance properties serialized
   * @returns {object}
   */
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

  /**
   * Returns the instance properties serialized to
   * the database format
   * Override in the extended class
   * @returns {object}
   */
  serializeToDB() {
    return this.serialize();
  }

  /**
   * Returns properties serialized from the database format
   * Override in the extended class
   * @param {object} json : The data received from the database
   * @returns {object}
   */
  static serializeOfDB(args) {
    return args;
  }

  /**
   * Creates a new instance from the database format
   * Override in the extended class
   * @param {object} json The data to initialize the instance
   * @returns {object} : An instance
   */
  static ofJSON(json) {
    const data = this.serializeOfDB(json);

    const obj = new this(data);

    return obj.setData(data).setDirty(false);
  }

  /**
   * Instance clean up
   * @private
   */
  destroy() {
    super.destroy();
  }
}
