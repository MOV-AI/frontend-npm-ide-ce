import Model from "../../../Model";
import schema from "./schema";
import Position from "../Position/Position";
import Manager from "../../../Manager";
import { Parameter } from "../../../subModels";

class SubFlow extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  propEvents = {
    onAny: (event, name, value) => this.propsUpdate(event, name, value)
  };

  // Model properties
  template = "";
  position = new Position();
  parameters = new Manager("parameters", Parameter, this.propEvents);

  // Define observable properties
  observables = Object.values(SubFlow.OBSERVABLE_KEYS);

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

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

  setPosition(x, y) {
    this.position.setData({ x, y });
    this.dispatch(
      SubFlow.OBSERVABLE_KEYS.POSITION,
      this.getPosition().serialize()
    );

    return this;
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

  //========================================================================================
  /*                                                                                      *
   *                                        Events                                        *
   *                                                                                      */
  //========================================================================================

  propsUpdate(event, prop, value) {
    // force dispatch
    this.dispatch(prop, value);
  }

  //========================================================================================
  /*                                                                                      *
   *                                      Serializers                                     *
   *                                                                                      */
  //========================================================================================

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
    const name = Object.keys(json)[0];
    const content = Object.values(json)[0];

    const {
      ContainerFlow: template,
      Visualization: position,
      Parameter: parameters
    } = content;

    return {
      name,
      template,
      position: Position.serializeOfDB(position),
      parameters: Manager.serializeOfDB(parameters, Parameter)
    };
  }

  static OBSERVABLE_KEYS = {
    NAME: "name",
    TEMPLATE: "template",
    POSITION: "position"
  };
}

SubFlow.defaults = {};

export default SubFlow;
