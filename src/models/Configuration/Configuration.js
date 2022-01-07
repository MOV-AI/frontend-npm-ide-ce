import Model from "../Model/Model";
import schema from "./schema";

export default class Configuration extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Extend Model properties and assign defaults
  code = "";
  extension = "yaml";

  // Define observable properties
  observables = Object.values(Configuration.OBSERVABLE_KEYS);

  getCode() {
    return this.code;
  }

  setCode(code) {
    this.code = code;
    return this;
  }

  getExtension() {
    return this.extension;
  }

  setExtension(extension) {
    this.extension = extension || this.extension;
    return this;
  }

  getScope() {
    return Configuration.SCOPE;
  }

  getFileExtension() {
    return Configuration.EXTENSION;
  }

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
   * Serialize model properties to database format
   * @returns {object} Database data
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
   * Serialize database data to model properties
   * @param {object} json : The data received from the database
   * @returns {object} Model properties
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
