import Model from "../../Model/Model";
import schema from "./schema";
import Parameters from "../Parameter/ParameterManager";
import Position from "./Position/Position";

class SubFlow extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Model properties
  name = "";
  template = "";
  position = new Position();
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
    return this.template;
  }

  setTemplate(value) {
    this.template = value;
    return this;
  }

  getPosition() {
    return this.position;
  }

  getParameters() {
    return this.parameters;
  }

  setData(json) {
    const { name, template, position, parameters } = json;
    super.setData({ name, template });

    this.position.setData(position);
    this.parameters.setData(parameters);
  }

  serialize() {
    return {
      name: this.getName(),
      template: this.getTemplate(),
      position: this.getPosition().serialize(),
      parameters: this.getParameters().serialize()
    };
  }

  serializeToDB() {
    const { name, template } = this.serialize();

    return {
      ContainerLabel: name,
      ContainerFlow: template,
      Visualization: this.getPosition().serializeToDB(),
      Parameter: this.getParameters().serializeToDB()
    };
  }

  static serializeOfDB(json) {
    const {
      ContainerLabel: name,
      ContainerFlow: template,
      Visualization: position,
      Parameter: parameters
    } = json;

    return {
      name,
      template,
      position: Position.serializeOfDB(position),
      parameters: Parameters.serializeOfDB(parameters)
    };
  }
}

export default SubFlow;
