import Model from "../../../Model";
import schema from "./schema";

class PortType extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Model properties
  message = "";
  callback = null;
  parameters = {};

  observables = ["name", "message", "callback", "parameters"];

  getMessage() {
    return this.message;
  }

  setMessage(value) {
    this.message = value;
    return this;
  }

  getCallback() {
    return this.callback;
  }

  setCallback(value) {
    this.callback = value;
    return this;
  }

  getParameters() {
    return this.parameters;
  }

  setParameters(value) {
    this.parameters = value;
    return this;
  }

  setParameter(name, value) {
    this.parameters[name] = value;
  }

  serialize() {
    return {
      name: this.getName(),
      message: this.getMessage(),
      callback: this.getCallback(),
      parameters: this.getParameters()
    };
  }

  serializeToDB() {
    const { message, callback, parameters } = this.serialize();

    return {
      Message: message,
      Parameter: parameters,
      ...(callback ? { Callback: callback } : {})
    };
  }

  static serializeOfDB(json) {
    const name = Object.keys(json)[0];
    const content = Object.values(json)[0];
    const {
      Message: message,
      Callback: callback,
      Parameter: parameters
    } = content;

    return { name, message, callback, parameters };
  }
}

export default PortType;
