import Model from "../../Model/Model";
import schema from "./schema";

class Node extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Model properties
  name = "";
  template = "";
  position = { x: 0, y: 0 };

  observables = ["name", "template", "position"];

  getName() {
    return this.name;
  }

  setName(value) {
    this.name = value;
    return this;
  }

  getTemplate() {
    // TODO: get the template instance
    return this.template;
  }

  setTemplate(value) {
    this.template = value;
    return this;
  }

  getPosition() {
    return this.position;
  }

  setPosition(x, y) {
    this.position = { x, y };
  }

  serialize() {
    return {
      name: this.getName(),
      template: this.getTemplate(),
      position: this.getPosition()
    };
  }

  serializeToDB() {
    const { name, template, position } = this.serialize();

    return {
      NodeLabel: name,
      Template: template,
      Visualization: {
        ...position
      }
    };
  }

  static serializeOfDB(json) {
    const {
      NodeLabel: name,
      Template: template,
      Visualization: position
    } = json;

    return { name, template, position };
  }
}

export default Node;
