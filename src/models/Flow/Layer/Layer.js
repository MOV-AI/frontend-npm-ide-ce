import Model from "../../Model/Model";
import schema from "./schema";

class Layer extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Model properties
  id = "";
  name = "";
  enabled = true;

  observables = ["name", "enabled"];

  getId() {
    return this.id;
  }

  setId(value) {
    this.id = value;
    return this;
  }

  getName() {
    return this.name;
  }

  setName(value) {
    this.name = value;
    return this;
  }

  getEnabled() {
    return this.enabled;
  }

  setEnabled(value) {
    this.enabled = value;
    return this;
  }

  serialize() {
    return {
      id: this.getId(),
      name: this.getName(),
      enabled: this.getEnabled()
    };
  }

  serializeToDB() {
    const { name, enabled } = this.serialize();

    return {
      name,
      on: enabled
    };
  }

  static serializeOfDB(json) {
    const id = Object.keys(json)[0];
    const content = Object.values(json)[0];
    const { name, on: enabled } = content;

    return { id, name, enabled };
  }
}

export default Layer;
