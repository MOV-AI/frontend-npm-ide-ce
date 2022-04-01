import Model from "../Model/Model";
import schema from "./schema";
import Manager from "../Manager";
import PyLib from "./subModels/PyLib";

export default class Callback extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  //========================================================================================
  /*                                                                                      *
   *                                        Events                                        *
   *                                                                                      */
  //========================================================================================

  pyLibs = new Manager("pyLibs", PyLib, {
    onAny: (event, name, value) => this.propsUpdate(event, name, value)
  });

  //========================================================================================
  /*                                                                                      *
   *                                   Model Properties                                   *
   *                                                                                      */
  //========================================================================================

  code = "";
  message = "";

  // Define observable properties
  observables = Object.values(Callback.OBSERVABLE_KEYS);

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the code property
   * @returns {string}
   */
  getCode() {
    return this.code;
  }

  /**
   * Sets the new value of the property
   * @param {string} value : The new value
   * @returns {Callback} : The instance
   */
  setCode(value) {
    this.code = value;
    return this;
  }

  /**
   * Returns the message property
   * @returns {string}
   */
  getMessage() {
    return this.message;
  }

  /**
   * Sets the new value of the property
   * @param {string} value : The new value
   * @returns {Callback} : The instance
   */
  setMessage(value) {
    this.message = value;
    return this;
  }

  /**
   * Returns the pyLibs manager
   * @returns {Manager}
   */
  getPyLibs() {
    return this.pyLibs;
  }

  /**
   * Adds a python lib to the list of imports
   * @param {object} value : The pylib to add
   * @returns {Callback} : The instance
   */
  addPythonLibs(value) {
    this.pyLibs = { ...this.pyLibs, ...value };
    return this;
  }

  /**
   * Deletes a python lib from the list of imports
   * @param {string} value : The id of the pyLib
   * @returns {Callback} : The instance
   */
  deletePythonLib(value) {
    const { [value]: _, ...newPyLibs } = this.pyLibs;
    this.pyLibs = { ...newPyLibs };
    return this;
  }

  /**
   * Returns the scope property
   * @returns {string}
   */
  getScope() {
    return Callback.SCOPE;
  }

  /**
   * Returns the extension property
   * @returns {string}
   */
  getFileExtension() {
    return Callback.EXTENSION;
  }

  /**
   * Updates the properties of the instance
   * @param {object} json : The data to update the instance
   * @returns {Callback} : The instance
   */
  setData(json) {
    const { name, details, code, message, pyLibs } = json;

    super.setData({ name, details, code, message });

    this.pyLibs.setData(pyLibs);

    return this;
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * @private
   * Forces the events dispatcher
   * @param {string} event : The name of the event
   * @param {string} prop : The of the property updated
   * @param {any} value : The new value of the property
   */
  propsUpdate(event, prop, value) {
    // force dispatch
    this.dispatch(prop, value);
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
      ...super.serialize(),
      code: this.getCode(),
      message: this.getMessage(),
      pyLibs: this.getPyLibs().serialize()
    };
  }

  /**
   * Returns the instance properties serialized to
   * the database format
   * @returns {object}
   */
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
   * Returns properties serialized from the database format
   * @param {object} json : The data received from the database
   * @returns {object}
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

  static KEYS_TO_DISCONSIDER = [this.OBSERVABLE_KEYS.CODE];
}
