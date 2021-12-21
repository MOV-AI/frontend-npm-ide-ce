import Model from "../../../../Model";
import schema from "./schema";

class Position extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Model properties
  x = 0;
  y = 0;

  observables = ["x", "y"];

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

  static serializeOfDB(json) {
    const output = {};

    Object.entries(json ?? {}).forEach(([name, content]) => {
      output[name] = content.Value ?? 0;
    });

    return output;
  }
}

export default Position;
