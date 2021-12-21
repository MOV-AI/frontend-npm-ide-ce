import Manager from "../Manager";
import Model from "../Model";
import { Parameter } from "../subModels"; // from shared subModels
import {
  ExposedPorts,
  ExposedPortsManager,
  Layer,
  Link,
  NodeInstance,
  SubFlow
} from "./subModels"; // from internal subModels
import LayerManager from "./subModels/Layer/LayerManager";
import schema from "./schema";

class Flow extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  propEvents = {
    onAny: (event, name, value) => this.propsUpdate(event, name, value)
  };

  // Extend Model properties and assign defaults
  info = "";
  description = "";

  exposedPorts = new ExposedPortsManager(
    "exposedPorts",
    ExposedPorts,
    this.propEvents
  );
  layers = new LayerManager("layers", Layer, this.propEvents);
  links = new Manager("links", Link, this.propEvents);
  nodeInstances = new Manager("nodeInstances", NodeInstance, this.propEvents);
  parameters = new Manager("parameters", Parameter, this.propEvents);
  subFlows = new Manager("subFlows", SubFlow, this.propEvents);

  // Define observable properties
  observables = ["name", "details", "info", "description"];

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

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
    return this.nodeInstances;
  }

  getSubFlows() {
    return this.subFlows;
  }

  getExposedPorts() {
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

  getFileExtension() {
    return Flow.EXTENSION;
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

    this.nodeInstances.setData(nodeInstances);
    this.subFlows.setData(subFlows);
    this.exposedPorts.setData(exposedPorts);
    this.links.setData(links);
    this.layers.setData(layers);
    this.parameters.setData(parameters);

    return this;
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
      ...super.serialize(),
      info: this.getInfo(),
      description: this.getDescription(),
      nodeInstances: this.getNodeInstances().serialize(),
      subFlows: this.getSubFlows().serialize(),
      exposedPorts: this.getExposedPorts().serialize(),
      links: this.getLinks().serialize(),
      layers: this.getLayers().serialize(),
      parameters: this.getParameters().serialize()
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
      NodeInst: this.getNodeInstances().serializeToDB(),
      Container: this.getSubFlows().serializeToDB(),
      ExposedPorts: this.getExposedPorts().serializeToDB(),
      Links: this.getLinks().serializeToDB(),
      Layers: this.getLayers().serializeToDB(),
      Parameter: this.getParameters().serializeToDB()
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
      Parameter: parameters
    } = json;

    return {
      id,
      name,
      details,
      workspace,
      version,
      info,
      description,
      nodeInstances: Manager.serializeOfDB(nodeInstances, NodeInstance),
      subFlows: Manager.serializeOfDB(subFlows, SubFlow),
      exposedPorts: ExposedPortsManager.serializeOfDB(
        exposedPorts,
        ExposedPorts
      ),
      links: Manager.serializeOfDB(links, Link),
      layers: Manager.serializeOfDB(layers, Layer),
      parameters: Manager.serializeOfDB(parameters, Parameter)
    };
  }

  static SCOPE = "Flow";

  static EXTENSION = ".flo";
}

Flow.defaults = {};

export default Flow;
