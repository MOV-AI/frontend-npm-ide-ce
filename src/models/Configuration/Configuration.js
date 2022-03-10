import Model from "../Model/Model";
import schema from "./schema";

export default class Configuration extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  //========================================================================================
  /*                                                                                      *
   *                                   Model Properties                                   *
   *                                                                                      */
  //========================================================================================

  code = "";
  extension = "yaml";

  // Define observable properties
  observables = Object.values(this.constructor.OBSERVABLE_KEYS);

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the code property
   * @returns {string}
   */
  getCode() {
    return this.code;
  }

  /**
   * Sets the new value of the property
   * @param {string} value : The new value
   * @returns {Configuration} : The instance
   */
  setCode(code) {
    this.code = code;
    return this;
  }

  /**
   * Returns the extension property
   * @returns {string}
   */
  getExtension() {
    return this.extension;
  }

  /**
   * Sets the new value of the property
   * @param {string} value : The new value
   * @returns {Configuration} : The instance
   */
  setExtension(extension) {
    this.extension = extension || this.extension;
    return this;
  }

  /**
   * Returns the scope property
   * @returns {string}
   */
  getScope() {
    return Configuration.SCOPE;
  }

  /**
   * Returns the file extension property
   * @returns {string}
   */
  getFileExtension() {
    return Configuration.EXTENSION;
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
      ...super.serialize(),
      code: this.getCode(),
      extension: this.getExtension()
    };
  }

  //========================================================================================
  /*                                                                                      *
   *                                        Static                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the instance properties serialized to
   * the database format
   * Override in the extended class
   * @returns {object}
   */
  serializeToDB() {
    const { name, code, extension, details } = this.serialize();

    return {
      Label: name,
      Yaml: code,
      Type: extension,
      LastUpdate: details
    };
  }

  /**
   * Returns properties serialized from the database format
   * Override in the extended class
   * @param {object} json : The data received from the database
   * @returns {object}
   */
  static serializeOfDB(json) {
    // Get defaults if DB value is not defined
    const extension = json.Type || Configuration.defaults.extension;
    // Get value from DB
    const {
      Label: id,
      Label: name,
      Yaml: code,
      LastUpdate: details,
      workspace,
      version
    } = json;

    return {
      id,
      name,
      code,
      extension,
      details,
      workspace,
      version
    };
  }

  static SCOPE = "Configuration";

  static EXTENSION = ".conf";

  static OBSERVABLE_KEYS = {
    NAME: "name",
    CODE: "code",
    DETAILS: "details",
    EXTENSION: "extension"
  };
}

// Default model values
Configuration.defaults = {
  extension: "yaml"
};
