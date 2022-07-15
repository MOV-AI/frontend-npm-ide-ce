import Model from "../../../../../models/Model";
import schema from "./schema";

class Position extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });

    //========================================================================================
    /*                                                                                      *
     *                                   Model Properties                                   *
     *                                                                                      */
    //========================================================================================

    this.x = 0;
    this.y = 0;

    // Define observable properties
    this.observables = Object.values(Position.OBSERVABLE_KEYS);
  }

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the x property
   * @returns {number}
   */
  getX() {
    return this.x;
  }

  /**
   * Sets the x property
   * @param {number} value : The new value
   * @returns {Position}
   */
  setX(value) {
    this.x = value;
    return this;
  }

  /**
   * Returns the y property
   * @returns {number}
   */
  getY() {
    return this.y;
  }

  /**
   * Sets the y property
   * @param {number} value : The new value
   * @returns {Position}
   */
  setY(value) {
    this.y = value;
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
      x: this.getX(),
      y: this.getY()
    };
  }

  /**
   * Returns the instance properties serialized to
   * the database format
   * @returns {object}
   */
  serializeToDB() {
    const { x, y } = this.serialize();

    return {
      x: { Value: x },
      y: { Value: y }
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
  static serializeOfDB(data) {
    if (Array.isArray(data)) {
      const position = data ?? [0, 0];

      return { x: position[0], y: position[1] };
    } else {
      const output = {};

      Object.entries(data ?? {}).forEach(([name, content]) => {
        output[name] = content.Value ?? 0;
      });

      return output;
    }
  }

  static OBSERVABLE_KEYS = {
    X: "x",
    Y: "y"
  };
}

export default Position;
