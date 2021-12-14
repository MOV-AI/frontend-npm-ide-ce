import Model from "../../Model/Model";
import schema from "./schema";
import Parameters from "../Parameter/ParameterManager";

class Node extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Model properties
  name = "";
  template = "";
  position = { x: 0, y: 0 };
  parameters = new Parameters();

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

  getParameters() {
    return this.parameters;
  }

  serialize() {
    return {
      name: this.getName(),
      template: this.getTemplate(),
      position: this.getPosition(),
      parameters: this.getParameters().serialize()
    };
  }

  serializeToDB() {
    const { name, template, position } = this.serialize();

    return {
      ContainerLabel: name,
      ContainerFlow: template,
      Visualization: {
        ...position
      },
      Parameter: this.getParameters().serializeToDB()
    };
  }

  static serializeOfDB(json) {
    const {
      ContainerLabel: name,
      ContainerFlow: template,
      Visualization: position
    } = json;

    return { name, template, position };
  }
}

export default Node;
