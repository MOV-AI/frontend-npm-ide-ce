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
    this.extension = extension;
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

  serializeToDB() {
    const { name, code, extension, details } = this.serialize();

    return {
      Label: name,
      Yaml: code,
      Type: extension,
      LastUpdate: details
    };
  }

  static ofJSON(json) {
    const {
      Label: id,
      Label: name,
      Yaml: code,
      Type: extension,
      LastUpdate: details,
      workspace,
      version
    } = json;

    return new this({ id, name, workspace, version })
      .setData({
        code,
        extension,
        details
      })
      .setDirty(false)
      .setIsNew(false);
  }

  static SCOPE = "Configuration";

  static EXTENSION = ".conf";

  static EMPTY = new Configuration({});
}
