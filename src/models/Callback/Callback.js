import Model from "../Model/Model";
import schema from "./schema";
import Manager from "../Manager";
import PyLib from "./PyLib";

export default class Callback extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Extend Model properties and assign defaults
  code = "";
  message = "";
  pyLibs = new Manager("pyLibs", PyLib, {
    onAny: (event, name, value) => this.propsUpdate(event, name, value)
  });

  // Define observable properties
  observables = Object.values(Callback.OBSERVABLE_KEYS);

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

  getPyLibs() {
    return this.pyLibs;
  }

  addPythonLibs(value) {
    this.pyLibs = { ...this.pyLibs, ...value };
    return this;
  }

  deletePythonLib(value) {
    const { [value]: _, ...newPyLibs } = this.pyLibs;
    this.pyLibs = { ...newPyLibs };
    return this;
  }

  getScope() {
    return Callback.SCOPE;
  }

  getFileExtension() {
    return Callback.EXTENSION;
  }

  propsUpdate(event, prop, value) {
    // force dispatch
    this.dispatch(prop, value);
  }

  setData(json) {
    const { name, details, code, message, pyLibs } = json;

    super.setData({ name, details, code, message });

    this.pyLibs.setData(pyLibs);

    return this;
  }

  serialize() {
    return {
      ...super.serialize(),
      code: this.getCode(),
      message: this.getMessage(),
      pyLibs: this.getPyLibs().serialize()
    };
  }

  serializeToDB() {
    const { name, details, code, message } = this.serialize();

    return {
      Label: name,
      Code: code,
      Message: message,
      LastUpdate: details,
      Py3Lib: this.pyLibs.serializeToDB()
    };
  }

  //========================================================================================
  /*                                                                                      *
   *                                        Static                                        *
   *                                                                                      */
  //========================================================================================

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
      details,
      workspace,
      version,
      pyLibs: Manager.serializeOfDB(pyLibs, PyLib)
    };
  }

  static SCOPE = "Callback";

  static EXTENSION = ".cb";

  static OBSERVABLE_KEYS = {
    NAME: "name",
    CODE: "code",
    DETAILS: "details",
    MESSAGE: "message"
  };
}
