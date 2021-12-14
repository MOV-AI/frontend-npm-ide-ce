import Model from "../Model/Model";
import schema from "./schema";

export default class Callback extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Extend Model properties and assign defaults
  code = "";
  message = "";
  pyLibs = {}; // {<name: str>:{Module:<module name:str>, Class:<is class:boolean>}}

  // Define observable properties
  observables = ["name", "details", "code", "message", "py3Lib"];

  getCode() {
    return this.code;
  }

  setCode(value) {
    this.code = value;
    return this;
  }

  getMessage() {
    return this.message;
  }

  setMessage(value) {
    this.message = value;
    return this;
  }

  getPythonLibs() {
    return this.pyLibs;
  }

  setPythonLibs(value) {
    this.pyLibs = value;
    return this;
  }

  getScope() {
    return Callback.SCOPE;
  }

  getFileExtension() {
    return Callback.EXTENSION;
  }

  serialize() {
    return {
      ...super.serialize(),
      code: this.getCode(),
      message: this.getMessage(),
      pyLibs: this.getPythonLibs()
    };
  }

  serializeToDB() {
    const { name, details, code, message, pyLibs } = this.serialize();

    return {
      Label: name,
      Code: code,
      Message: message,
      LastUpdate: details,
      Py3Lib: pyLibs
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
      Code: code,
      Message: message,
      Py3Lib: pyLibs,
      LastUpdate: details,
      workspace,
      version
    } = json;

    return {
      id,
      name,
      code,
      message,
      pyLibs,
      details,
      workspace,
      version
    };
  }

  static SCOPE = "Callback";

  static EXTENSION = ".cb";
}
