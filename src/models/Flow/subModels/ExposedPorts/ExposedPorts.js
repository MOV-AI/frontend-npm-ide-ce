import Model from "../../../Model";
import schema from "./schema";

class ExposedPorts extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  //========================================================================================
  /*                                                                                      *
   *                                   Model Properties                                   *
   *                                                                                      */
  //========================================================================================

  // Extend Model properties (name, details, ...)
  ports = [];

  // Define observable properties
  observables = Object.values(ExposedPorts.OBSERVABLE_KEYS);

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the ports property
   * @returns {array}
   */
  getPorts() {
    return this.ports;
  }

  /**
   * Sets the ports property
   * @param {array} value : The new value
   * @returns {ExposedPorts}
   */
  setPorts(value) {
    this.ports = value;
    return this;
  }

  /**
   * Adds a new exposed port
   * @param {any} value : The port value
   * @returns {ExposedPorts}
   */
  addPort(value) {
    this.ports = [...this.ports, value];
    return this.ports;
  }

  /**
   * Removes a new exposed port
   * @param {any} value : The port value
   * @returns {ExposedPorts}
   */
  removePort(value) {
    this.ports = this.ports.filter(v => v !== value);
    return this.ports;
  }

  /**
   * Toggle the exposed port
   * @param {any} value
   * @returns {ExposedPorts}
   */
  togglePort(value) {
    return this.ports.includes(value)
      ? this.removePort(value)
      : this.addPort(value);
  }

  /**
   * Returns the number of ports exposed
   * @returns {number}
   */
  count() {
    return this.ports.length;
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
      ports: this.getPorts()
    };
  }

  /**
   * Returns the instance properties serialized to
   * the database format
   * @returns {object}
   */
  serializeToDB() {
    const { name, ports } = this.serialize();

    return {
      [name]: ports
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
    const content = Object.values(json ?? {})[0];
    const name = Object.keys(content ?? {})[0];
    const ports = Object.values(content ?? {})[0];

    return { name, ports };
  }

  static OBSERVABLE_KEYS = {
    NAME: "name",
    PORTS: "ports"
  };
}

export default ExposedPorts;
