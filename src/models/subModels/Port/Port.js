import Model from "../../Model";
import Manager from "../../Manager";
import schema from "./schema";
import PortType from "./PortType";

class Port extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Model properties
  description = "";
  template = "";
  msgPackage = "";
  message = "";
  portIn = new Manager("portIn", PortType, {});
  portOut = new Manager("portOut", PortType, {});

  observables = ["name", "description", "template", "msgPackage", "message"];

  getDescription() {
    return this.description;
  }

  setDescription(value) {
    this.description = value;
    return this;
  }

  getTemplate() {
    return this.template;
  }

  setTemplate(value) {
    this.template = value;
    return this;
  }

  getPackage() {
    return this.msgPackage;
  }

  setPackage(value) {
    this.msgPackage = value;
    return this;
  }

  getMessage() {
    return this.message;
  }

  setMessage(value) {
    this.message = value;
    return this;
  }

  getPortIn() {
    return this.portIn;
  }

  getPortOut() {
    return this.portOut;
  }

  setData(json) {
    const {
      name,
      details,
      description,
      template,
      msgPackage,
      message,
      portIn,
      portOut
    } = json;

    super.setData({
      name,
      details,
      description,
      template,
      msgPackage,
      message
    });

    this.portIn.setData(portIn);
    this.portOut.setData(portOut);

    return this;
  }

  serialize() {
    return {
      name: this.getName(),
      description: this.getDescription(),
      template: this.getTemplate(),
      msgPackage: this.getPackage(),
      message: this.getMessage(),
      portIn: this.getPortIn().serialize(),
      portOut: this.getPortOut().serialize()
    };
  }

  serializeToDB() {
    const { description, template, message, msgPackage } = this.serialize();

    return {
      Info: description,
      Template: template,
      Package: msgPackage,
      Message: message,
      In: this.portIn.serializeToDB(),
      Out: this.portOut.serializeToDB()
    };
  }

  static serializeOfDB(json) {
    const name = Object.keys(json)[0];
    const content = Object.values(json)[0];

    const {
      Info: description,
      Template: template,
      Message: message,
      Package: msgPackage,
      In: portIn,
      Out: portOut
    } = content;

    return {
      name,
      description,
      template,
      message,
      msgPackage,
      portIn: Manager.serializeOfDB(portIn, PortType),
      portOut: Manager.serializeOfDB(portOut, PortType)
    };
  }
}

export default Port;
