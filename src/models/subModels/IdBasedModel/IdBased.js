import Model from "../../Model";
import schema from "./schema";

class IdBased extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });

    //========================================================================================
    /*                                                                                      *
     *                                   Model Properties                                   *
     *                                                                                      */
    //========================================================================================

    this.id = "";

    // Define observable properties
    this.observables = Object.values(IdBased.OBSERVABLE_KEYS);
  }

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the id property
   * @returns {string}
   */
  getId() {
    return this.id;
  }

  /**
   * Sets the id property
   * @param {string} value : The new value
   * @returns {IdBased}
   */
  setId(value) {
    this.id = value;
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
      id: this.getId(),
      name: this.getName()
    };
  }

  /**
   * Returns the instance properties serialized to
   * the database format
   * @returns {object}
   */
  serializeToDB() {
    const { name } = this.serialize();

    return {
      name
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
    const id = Object.keys(json)[0];
    const content = Object.values(json)[0];
    const { name } = content;

    return { id, name };
  }

  static OBSERVABLE_KEYS = {
    NAME: "name"
  };
}

export default IdBased;
