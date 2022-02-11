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
  value = "";
  type = Parameter.defaults.type;
  description = "";

  // Define observable properties
  observables = Object.values(Parameter.OBSERVABLE_KEYS);

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

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
   * @returns {Parameter} : The instance
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
   * @returns {Parameter} : The instance
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
   * @returns {Parameter} : The instance
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
    const name = Object.keys(json)[0];
    const content = Object.values(json)[0];
    const type = content.Type ?? Parameter.defaults.type;
    const { Value: value, Description: description } = content;

    return { name, value, type, description };
  }

  static OBSERVABLE_KEYS = {
    NAME: "name",
    VALUE: "value",
    DESCRIPTION: "description",
    TYPE: "type"
  };
}

// Default model values
Parameter.defaults = {
  type: "any"
};

export default Parameter;
