import Model from "../Model/Model";
import schema from "./schema";

export default class Node extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  description = "";
  type = "";
  path = "";
  persistent = false;
  remappable = true;
  launch = true;

  // Define observable properties
  observables = [
    "name",
    "details",
    "description",
    "type",
    "path",
    "persistent",
    "remappable",
    "launch"
  ];

  setDescription(value) {
    this.description = value;
    return this;
  }

  getDescription() {
    return this.description;
  }

  setType(value) {
    this.type = value;
    return this;
  }

  getType() {
    return this.type;
  }

  setExecutionParameter(parameter, value) {
    this[parameter] = value;
  }

  getExecutionParameters() {
    return {
      persistent: this.persistent,
      remappable: this.remappable,
      launch: this.launch
    };
  }

  setPath(value) {
    this.path = value;
    return this;
  }

  getPath() {
    return this.path;
  }

  getScope() {
    return Node.SCOPE;
  }

  getFileExtension() {
    return Node.EXTENSION;
  }

  serialize() {
    return {
      ...super.serialize(),
      type: this.getType(),
      description: this.getDescription(),
      path: this.getPath(),
      ...this.getExecutionParameters()
    };
  }

  /**
   * Serialize database data to model properties
   * @param {object} json : The data received from the database
   * @returns {object} Model properties
   */
  static serializeOfDB(json) {
    console.log("debug serializeOfDB", json);
    const {
      Label: id,
      Label: name,
      Info: description,
      Path: path,
      Persistent: persistent,
      Remappable: remappable,
      Launch: launch,
      Type: type,
      LastUpdate: details,
      workspace,
      version
    } = json;

    return {
      id,
      name,
      description,
      type,
      persistent: persistent === "" ? false : persistent,
      remappable: remappable === "" ? true : remappable,
      launch: launch === "" ? true : launch,
      path,
      details,
      workspace,
      version
    };
  }

  static SCOPE = "Node";
  static EXTENSION = ".nd";

  static ofJSON(json) {
    return new Node(json.Label);
  }
}
