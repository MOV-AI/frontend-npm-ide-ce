import Model from "../../Model/Model";
import schema from "./schema";

class EnvVar extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Model properties
  name = "";
  value = "";
  description = "";

  observables = ["name", "value", "description"];

  getName() {
    return this.name;
  }

  setName(value) {
    this.name = value;
    return this;
  }

  getValue() {
    return this.value;
  }

  setValue(value) {
    this.value = value;
    return this;
  }

  getDescription() {
    return this.description;
  }

  setDescription(value) {
    this.description = value;
    return this;
  }

  serialize() {
    return {
      name: this.getName(),
      value: this.getValue()
    };
  }

  serializeToDB() {
    const { value } = this.serialize();

    return {
      Value: value
    };
  }

  static serializeOfDB(json) {
    const name = Object.keys(json)[0];
    const content = Object.values(json)[0];
    const { Value: value } = content;

    return { name, value };
  }
}

export default EnvVar;
