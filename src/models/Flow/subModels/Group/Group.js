import IdBasedModel from "../../../subModels/IdBasedModel/IdBased";
import schema from "./schema";

class Group extends IdBasedModel {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });

    //========================================================================================
    /*                                                                                      *
     *                                   Model Properties                                   *
     *                                                                                      */
    //========================================================================================

    this.id = "";
    this.enabled = true;

    // Define observable properties
    this.observables = Object.values(Group.OBSERVABLE_KEYS);
  }

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the enabled property
   * @returns {boolean}
   */
  getEnabled() {
    return this.enabled;
  }

  /**
   * Sets the enabled property
   * @param {boolean} value : The new value
   * @returns {Group}
   */
  setEnabled(value) {
    this.enabled = value;
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
      name: this.getName(),
      enabled: this.getEnabled()
    };
  }

  /**
   * Returns the instance properties serialized to
   * the database format
   * @returns {object}
   */
  serializeToDB() {
    const { name, enabled } = this.serialize();

    return {
      name,
      on: enabled
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
    const { name, on: enabled } = content;

    return { id, name, enabled };
  }

  static OBSERVABLE_KEYS = {
    NAME: "name",
    ENABLED: "enabled"
  };
}

export default Group;
