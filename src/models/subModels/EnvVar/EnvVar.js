import Model from "../../Model/Model";
import schema from "./schema";

class EnvVar extends Model {
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
  description = "";

  observables = ["name", "value", "description"];

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
   * @returns {EnvVar} : The instance
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
   * @returns {EnvVar} : The instance
   */
  setValue(value) {
    this.value = value;
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
   * @returns {EnvVar} : The instance
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
      description: this.getDescription()
    };
  }

  /**
   * Returns the instance properties serialized to
   * the database format
   * @returns {object}
   */
  serializeToDB() {
    const { value, description } = this.serialize();

    return {
      Value: value,
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
    const { Value: value, Description: description } = content;

    return { name, value, description };
  }
}

export default EnvVar;
