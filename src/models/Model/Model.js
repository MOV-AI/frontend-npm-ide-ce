import BaseModel from "./BaseModel";
import Schema from "./Schema";

class Model extends BaseModel {
  constructor({ schema, name, details, isNew }) {
    super({ name, details, isNew });

    this.schema = new Schema(schema);
  }

  validate() {
    return this.schema.validate(this.serialize());
  }
}

export default Model;
