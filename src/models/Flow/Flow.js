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

  setData(json) {
    const {
      info,
      description,
      name,
      details,
      nodeInstances,
      subFlows,
      exposedPorts,
      links,
      layers,
      parameters
    } = json;

    super.setData({ info, description, name, details });

    this.nodeInstances.setData(
      NodeInstances.serializeOfDB(nodeInstances ?? {})
    );

    this.subFlows.setData(SubFlows.serializeOfDB(subFlows ?? {}));
    this.exposedPorts.setData(ExposedPorts.serializeOfDB(exposedPorts ?? {}));
    this.links.setData(Links.serializeOfDB(links ?? {}));
    this.layers.setData(Layers.serializeOfDB(layers ?? {}));
    this.parameters.setData(Parameters.serializeOfDB(parameters ?? {}));

    return this;
  }

  serialize() {
    return {
      ...super.serialize(),
      info: this.getInfo(),
      description: this.getDescription(),
      nodeInstances: this.nodeInstances.serialize(),
      subFlows: this.subFlows.serialize(),
      exposedPorts: this.exposedPorts.serialize(),
      links: this.links.serialize(),
      layers: this.layers.serialize(),
      parameters: this.parameters.serialize()
    };
  }

  /**
   * Serialize model properties to database format
   * @returns {object} Database data
   */
  serializeToDB() {
    const { info, name, description, details } = this.serialize();

    return {
      Info: info,
      Label: name,
      Description: description,
      LastUpdate: details,
      NodeInst: this.nodeInstances.serializeToDB(),
      Container: this.subFlows.serializeToDB(),
      ExposedPorts: this.exposedPorts.serializeToDB(),
      Links: this.links.serializeToDB(),
      Layers: this.layers.serializeToDB(),
      Parameter: this.parameters.serializeToDB()
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
      version,
      Info: info,
      Description: description,
      NodeInst: nodeInstances,
      Container: subFlows,
      ExposedPorts: exposedPorts,
      Links: links,
      Layers: layers,
      Parameters: parameters
    } = json;

    return {
      id,
      name,
      details,
      workspace,
      version,
      info,
      description,
      nodeInstances: NodeInstances.serializeOfDB(nodeInstances),
      subFlows: SubFlows.serializeOfDB(subFlows),
      exposedPorts: ExposedPorts.serializeOfDB(exposedPorts),
      links: Links.serializeOfDB(links),
      layers: Layers.serializeOfDB(layers),
      parameters: Parameters.serializeOfDB(parameters)
    };
  }

  static SCOPE = "Flow";

  static EXTENSION = ".flo";

  static EMPTY = new Flow({});
}
