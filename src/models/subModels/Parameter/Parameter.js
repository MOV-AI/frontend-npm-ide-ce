import Model from "../../Model/Model";
import schema from "./schema";

class Parameter extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  //========================================================================================
  /*                                                                                      *
   *                                   Model Properties                                   *
   *                                                                                      */
  //========================================================================================

  name = "";
  value = "";
  type = Parameter.defaults.type;
  description = "";

  observables = ["name", "value", "type", "description"];

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the name property
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * Sets the new value of the property
   * @param {string} value : The new value
   * @returns {object} : The instance
   */
  setName(value) {
    this.name = value;
    return this;
  }

  /**
   * Returns the value property
   * @returns {string}
   */
  getValue() {
    return this.value;
  }

  /**
   * Sets the new value of the property
   * @param {string} value : The new value
   * @returns {object} : The instance
   */
  setValue(value) {
    this.value = value;
    return this;
  }

  /**
   * Returns the type property
   * @returns {string}
   */
  getType() {
    return this.type;
  }

  /**
   * Sets the new value of the property
   * @param {string} value : The new value
   * @returns {object} : The instance
   */
  setType(value) {
    this.type = value;
    return this;
  }

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
   * @returns {object} : The instance
   */
  setDescription(value) {
    this.description = value;
    return this;
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
      value: this.getValue(),
      type: this.getType(),
      description: this.getDescription()
    };
  }

  /**
   * Returns the instance properties serialized to
   * the database format
   * @returns {object}
   */
  serializeToDB() {
    const { value, description, type } = this.serialize();

    return {
      Value: value,
      Type: type,
      Description: description
    };
  }

  /**
   * Returns properties serialized from the database format
   * @param {object} json : The data received from the database
   * @returns {object}
   */
  static serializeOfDB(json) {
    const name = Object.keys(json)[0];
    const content = Object.values(json)[0];
    const { Value: value, Type: type, Description: description } = content;

    return { name, value, type: type ?? Parameter.defaults.type, description };
  }
}
Parameter.defaults = {
  type: "any"
};

export default Parameter;
