import Model from "../Model/Model";
import schema from "./schema";
import NodeInstances from "./Node/NodeManager";
import Links from "./Link/LinkManager";
import Parameters from "./Parameter/ParameterManager";
import Layers from "./Layer/LayerManager";
import ExposedPorts from "./ExposedPort/ExposedPortsManager";
import SubFlows from "./SubFlow/SubFlowManager";

export default class Flow extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Extend Model properties and assign defaults
  info = "";
  description = "";
  nodeInstances = new NodeInstances();
  subFlows = new SubFlows();
  exposedPorts = new ExposedPorts();
  links = new Links();
  layers = new Layers();
  parameters = new Parameters();

  // Define observable properties
  observables = ["name", "details", "info", "description"];

  getInfo() {
    return this.info;
  }

  setInfo(value) {
    this.info = value;
    return this;
  }

  getDescription() {
    return this.description;
  }

  setDescription(value) {
    this.description = value;
    return this;
  }

  getNodeInstances() {
    return this.nodeInstances();
  }

  getSubFlows() {
    return this.subFlows;
  }

  geExposedPorts() {
    return this.exposedPorts;
  }

  getLinks() {
    return this.links;
  }

  getLayers() {
    return this.layers;
  }

  getParameters() {
    return this.parameters;
  }

  getScope() {
    return Flow.SCOPE;
  }

  serialize() {
    return {
      ...super.serialize()
    };
  }

  /**
   * Serialize model properties to database format
   * @returns {object} Database data
   */
  serializeToDB() {
    const { name, code, extension, details } = this.serialize();

    return {
      Label: name
    };
  }

  /**
   * Serialize database data to model properties
   * @param {object} json : The data received from the database
   * @returns {object} Model properties
   */
  static serializeOfDB(json) {
    const {
      Label: id,
      Label: name,
      LastUpdate: details,
      workspace,
      version
    } = json;

    return {
      id,
      name,
      details,
      workspace,
      version
    };
  }

  static SCOPE = "Flow";

  static EXTENSION = ".flo";

  static EMPTY = new Flow({});
}
