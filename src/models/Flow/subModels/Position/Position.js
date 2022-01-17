import Model from "../../../Model/Model";
import schema from "./schema";

class Position extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  //========================================================================================
  /*                                                                                      *
   *                                      Properties                                      *
   *                                                                                      */
  //========================================================================================

  x = 0;
  y = 0;

  observables = ["x", "y"];

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  getX() {
    return this.x;
  }

  setX(value) {
    this.x = value;
    return this;
  }

  getY() {
    return this.y;
  }

  setY(value) {
    this.y = value;
    return this;
  }

  //========================================================================================
  /*                                                                                      *
   *                                      Serializers                                     *
   *                                                                                      */
  //========================================================================================

  serialize() {
    return {
      name: this.getName(),
      x: this.getX(),
      y: this.getY()
    };
  }

  serializeToDB() {
    const { x, y } = this.serialize();

    return {
      x: { Value: x },
      y: { Value: y }
    };
  }

  /**
   *
   * @param {array or object} data : The data with the position
   * @returns {array} : The position
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
}

export default Position;
