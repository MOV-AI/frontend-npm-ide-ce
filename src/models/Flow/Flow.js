import Manager from "../Manager";
import Model from "../Model";
import { Parameter } from "../subModels"; // from shared subModels
import {
  ExposedPorts,
  ExposedPortsManager,
  Group,
  Link,
  NodeInstance,
  SubFlow
} from "./subModels"; // from internal subModels
import GroupManager from "./subModels/Group/GroupManager";
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
  description = "";

  exposedPorts = new ExposedPortsManager(
    "exposedPorts",
    ExposedPorts,
    this.propEvents
  );
  groups = new GroupManager("groups", Group, this.propEvents);
  links = new Manager("links", Link, this.propEvents);
  nodeInstances = new Manager("nodeInstances", NodeInstance, this.propEvents);
  parameters = new Manager("parameters", Parameter, this.propEvents);
  subFlows = new Manager("subFlows", SubFlow, this.propEvents);

  // Define observable properties
  observables = ["name", "details", "description"];

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

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

  getGroups() {
    return this.groups;
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
      description,
      name,
      details,
      nodeInstances,
      subFlows,
      exposedPorts,
      links,
      groups,
      parameters
    } = json;

    super.setData({ description, name, details });

    this.nodeInstances.setData(nodeInstances);
    this.subFlows.setData(subFlows);
    this.exposedPorts.setData(exposedPorts);
    this.links.setData(links);
    this.groups.setData(groups);
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
      description: this.getDescription(),
      nodeInstances: this.getNodeInstances().serialize(),
      subFlows: this.getSubFlows().serialize(),
      exposedPorts: this.getExposedPorts().serialize(),
      links: this.getLinks().serialize(),
      groups: this.getGroups().serialize(),
      parameters: this.getParameters().serialize()
    };
  }

  /**
   * Serialize model properties to database format
   * @returns {object} Database data
   */
  serializeToDB() {
    const { name, description, details } = this.serialize();

    return {
      Label: name,
      Description: description,
      LastUpdate: details,
      NodeInst: this.getNodeInstances().serializeToDB(),
      Container: this.getSubFlows().serializeToDB(),
      ExposedPorts: this.getExposedPorts().serializeToDB(),
      Links: this.getLinks().serializeToDB(),
      groups: this.getGroups().serializeToDB(),
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
      Description: description,
      NodeInst: nodeInstances,
      Container: subFlows,
      ExposedPorts: exposedPorts,
      Links: links,
      Layers: groups,
      Parameter: parameters
    } = json;

    return {
      id,
      name,
      details,
      workspace,
      version,
      description,
      nodeInstances: Manager.serializeOfDB(nodeInstances, NodeInstance),
      subFlows: Manager.serializeOfDB(subFlows, SubFlow),
      exposedPorts: ExposedPortsManager.serializeOfDB(
        exposedPorts,
        ExposedPorts
      ),
      links: Manager.serializeOfDB(links, Link),
      groups: Manager.serializeOfDB(groups, Group),
      parameters: Manager.serializeOfDB(parameters, Parameter)
    };
  }

  static SCOPE = "Flow";

  static EXTENSION = ".flo";
}

Flow.defaults = {};

export default Flow;
