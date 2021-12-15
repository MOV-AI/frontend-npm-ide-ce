import Model from "../../Model/Model";
import schema from "./schema";

class NodeExposedPorts extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Extend Model properties (name, details, ...)
  template = "";
  ports = [];

  observables = ["name", "template", "ports"];

  getTemplate() {
    return this.template;
  }

  setTemplate(value) {
    this.template = value;
    return this;
  }

  getPorts() {
    return this.ports;
  }

  setPorts(value) {
    this.ports = value;
    return this;
  }

  addPort(value) {
    this.ports = [...this.ports, value];
    return this.ports;
  }

  removePort(value) {
    this.ports = this.ports.filter(v => v !== value);
    return this.ports;
  }

  togglePort(value) {
    return this.ports.includes(value)
      ? this.removePort(value)
      : this.addPort(value);
  }

  count() {
    return this.ports.length;
  }

  serialize() {
    return {
      template: this.getTemplate(),
      name: this.getName(),
      ports: this.getPorts()
    };
  }

  serializeToDB() {
    const { name, ports } = this.serialize();

    return {
      [name]: ports
    };
  }

  static serializeOfDB(json) {
    const template = Object.keys(json)[0];
    const content = Object.values(json)[0];
    const name = Object.keys(content)[0];
    const ports = Object.values(content)[0];

    return { name, template, ports };
  }
}

export default NodeExposedPorts;
