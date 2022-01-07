import Model from "../../Model/Model";
import schema from "./schema";

class Parameter extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Model properties
  value = "";
  type = Parameter.defaults.type;
  description = "";

  observables = ["name", "value", "type", "description"];

  getValue() {
    return this.value;
  }

  setValue(value) {
    this.value = value;
    return this;
  }

  getType() {
    return this.type;
  }

  setType(value) {
    this.type = value;
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
      value: this.getValue(),
      type: this.getType(),
      description: this.getDescription()
    };
  }

  serializeToDB() {
    const { value, description, type } = this.serialize();

    return {
      Value: value,
      Type: type,
      Description: description
    };
  }

  static serializeOfDB(json) {
    const name = Object.keys(json)[0];
    const content = Object.values(json)[0];
    const type = content.Type ?? Parameter.defaults.type;
    const { Value: value, Description: description } = content;

    return { name, value, type, description };
  }
}

// Default model values
Parameter.defaults = {
  type: "any"
};

export default Parameter;
