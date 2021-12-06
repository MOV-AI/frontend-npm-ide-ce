import BaseModel from "../Model/Model";
import schema from "./schema";

export default class Callback extends BaseModel {
  /**
   * This should be private
   * @param {*} name
   * @param {*} extension
   * @param {*} code
   * @param {*} details
   */
  constructor(name, code, details) {
    super({ schema, name, details });

    this.toDecorate = ["setCode"];

    this.code = code || "";
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

  getScope() {
    return Callback.SCOPE;
  }

  // serialize() {
  //   return {
  //     Label: this.getName(),
  //     Code: this.getCode(),
  //     LastUpdate: this.getDetails()
  //   };
  // }

  getFileExtension() {
    return ".cb";
  }

  static SCOPE = "Callback";

  static ofJSON(json) {
    const {
      Label: name,
      Yaml: code,
      Type: extension,
      LastUpdate: details
    } = json;
    return new Callback(name, extension, code, details);
  }

  static EMPTY = new Callback();
}
