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
  observables = ["name", "details", "code", "extension"];

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
    const {
      Label: id,
      Label: name,
      Yaml: code,
      Type: extension,
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
}
