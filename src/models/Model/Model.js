import BaseModel from "./BaseModel";
import Schema from "./Schema";

class Model extends BaseModel {
  constructor() {
    const { schema, ...otherArgs } = arguments[0];
    super({ ...otherArgs });

    this.schema = new Schema(schema || {});
  }

  validate() {
    return this.schema.validate(this.serialize());
  }
}

export default Model;
