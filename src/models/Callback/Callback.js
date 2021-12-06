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
  py3Lib = {}; // {<name: str>:{Module:<module name:str>, Class:<is class:boolean>}}

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

  getPy3Lib() {
    return this.py3Lib;
  }

  setPy3Lib(value) {
    this.py3Lib = value;
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
      py3Lib: this.getPy3Lib()
    };
  }

  serializeToDB() {
    const { name, details, code, message, py3Lib } = this.serialize();

    return {
      Label: name,
      Code: code,
      Message: message,
      LastUpdate: details,
      Py3Lib: py3Lib
    };
  }

  static ofJSON(json) {
    const {
      Label: id,
      Label: name,
      Code: code,
      Message: message,
      Py3Lib: py3Lib,
      LastUpdate: details,
      workspace,
      version
    } = json;

    const obj = new this({ id, name, workspace, version });

    return obj
      .setData({
        code,
        message,
        py3Lib,
        details
      })
      .setDirty(false)
      .setIsNew(false);
  }

  static SCOPE = "Callback";

  static EXTENSION = ".cb";

  static EMPTY = new Callback();
}
