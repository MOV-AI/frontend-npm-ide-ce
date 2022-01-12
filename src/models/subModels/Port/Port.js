import Model from "../../Model";
import Manager from "../../Manager";
import schema from "./schema";
import PortType from "./PortType";

class Port extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  //========================================================================================
  /*                                                                                      *
   *                                        Events                                        *
   *                                                                                      */
  //========================================================================================

  events = {
    onAny: (event, name, value) => this.propsUpdate(event, name, value)
  };

  //========================================================================================
  /*                                                                                      *
   *                                   Model Properties                                   *
   *                                                                                      */
  //========================================================================================

  description = "";
  template = "";
  msgPackage = "";
  message = "";
  portIn = new Manager("portIn", PortType, this.events);
  portOut = new Manager("portOut", PortType, this.events);

  observables = ["name", "description", "template", "msgPackage", "message"];

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the description property
   * @returns {string}
   */
  getDescription() {
    return this.description;
  }

  /**
   * Sets the new value of the property
   * @param {string} value : The new value
   * @returns {Port} : The instance
   */
  setDescription(value) {
    this.description = value;
    return this;
  }

  /**
   * Returns the template property
   * @returns {string}
   */
  getTemplate() {
    return this.template;
  }

  /**
   * Sets the new value of the property
   * @param {string} value : The new value
   * @returns {Port} : The instance
   */
  setTemplate(value) {
    this.template = value;
    return this;
  }

  /**
   * Returns the msgPackage property
   * @returns {string}
   */
  getPackage() {
    return this.msgPackage;
  }

  /**
   * Sets the new value of the property
   * @param {string} value : The new value
   * @returns {Port} : The instance
   */
  setPackage(value) {
    this.msgPackage = value;
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
   * @returns {Port} : The instance
   */
  setMessage(value) {
    this.message = value;
    return this;
  }

  /**
   * Returns the portIn property
   * @returns {Manager}
   */
  getPortIn() {
    return this.portIn;
  }

  /**
   * Returns the portOut property
   * @returns {Manager}
   */
  getPortOut() {
    return this.portOut;
  }

  /**
   * Updates the properties of the instance
   * @param {object} json : The data to update the instance
   * @returns {Port} : The instance
   */
  setData(json) {
    const {
      name,
      details,
      description,
      template,
      msgPackage,
      message,
      portIn,
      portOut
    } = json;

    super.setData({
      name,
      details,
      description,
      template,
      msgPackage,
      message
    });

    this.portIn.setData(portIn);
    this.portOut.setData(portOut);

    return this;
  }

  //========================================================================================
  /*                                                                                      *
   *                                        Events                                        *
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
      name: this.getName(),
      description: this.getDescription(),
      template: this.getTemplate(),
      msgPackage: this.getPackage(),
      message: this.getMessage(),
      portIn: this.getPortIn().serialize(),
      portOut: this.getPortOut().serialize()
    };
  }

  /**
   * Returns the instance properties serialized to
   * the database format
   * Override in the extended class
   * @returns {object}
   */
  serializeToDB() {
    const { description, template, message, msgPackage } = this.serialize();

    return {
      Info: description,
      Template: template,
      Package: msgPackage,
      Message: message,
      In: this.portIn.serializeToDB(),
      Out: this.portOut.serializeToDB()
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
      Info: description,
      Template: template,
      Message: message,
      Package: msgPackage,
      In: portIn,
      Out: portOut
    } = content;

    return {
      name,
      description,
      template,
      message,
      msgPackage,
      portIn: Manager.serializeOfDB(portIn, PortType),
      portOut: Manager.serializeOfDB(portOut, PortType)
    };
  }
}

export default Port;
