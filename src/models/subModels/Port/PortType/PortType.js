import Model from "../../../Model";
import schema from "./schema";

class PortType extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  //========================================================================================
  /*                                                                                      *
   *                                   Model Properties                                   *
   *                                                                                      */
  //========================================================================================

  message = "";
  callback = null;
  parameters = {};

  observables = ["name", "message", "callback", "parameters"];

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the message property
   * @returns {string}
   */
  getMessage() {
    return this.message;
  }

  setMessage(value) {
    this.message = value;
    return this;
  }

  /**
   * Returns the callback property
   * @returns {string}
   */
  getCallback() {
    return this.callback;
  }

  setCallback(value) {
    this.callback = value;
    return this;
  }

  /**
   * Returns the parameters property
   * @returns {object}
   */
  getParameters() {
    return this.parameters;
  }

  /**
   * Sets the parameters value
   * @param {object} value : The parameters value
   * @returns {object} : The instance
   */
  setParameters(value) {
    this.parameters = value;
    return this;
  }

  /**
   * Sets the value of a parameter
   * @param {string} name : The name of the parameter
   * @param {any} value : The new value of the parameter
   */
  setParameter(name, value) {
    this.parameters[name] = value;
    this.dispatch("parameters", this.getParameters());
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
      name: this.getName(),
      message: this.getMessage(),
      callback: this.getCallback(),
      parameters: this.getParameters()
    };
  }

  /**
   * Returns the instance properties serialized to
   * the database format
   * Override in the extended class
   * @returns {object}
   */
  serializeToDB() {
    const { message, callback, parameters } = this.serialize();

    return {
      Message: message,
      Parameter: parameters,
      ...(callback ? { Callback: callback } : {})
    };
  }

  /**
   * Returns properties serialized from the database format
   * Override in the extended class
   * @param {object} json : The data received from the database
   * @returns {object}
   */
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
