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
import { randomId } from "../../utils/Utils";
import schema from "./schema";

class Flow extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  //========================================================================================
  /*                                                                                      *
   *                                        Events                                        *
   *                                                                                      */
  //========================================================================================

  propEvents = {
    onAny: (event, name, value) => this.propsUpdate(event, name, value)
  };

  //========================================================================================
  /*                                                                                      *
   *                                   Model Properties                                   *
   *                                                                                      */
  //========================================================================================

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
  observables = Object.values(Flow.OBSERVABLE_KEYS);

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the description property
   * @returns {string}
   */
  getDescription() {
    return this.description;
  }

  /**
   * Sets the description property
   * @param {string} value : The new value
   * @returns {Flow}
   */
  setDescription(value) {
    this.description = value;
    return this;
  }

  /**
   * Returns the node instances manager
   * @returns {Manager}
   */
  getNodeInstances() {
    return this.nodeInstances;
  }

  /**
   * Returns the sub-flows manager
   * @returns {Manager}
   */
  getSubFlows() {
    return this.subFlows;
  }

  /**
   * Returns the exposed ports manager
   * @returns {Manager}
   */
  getExposedPorts() {
    return this.exposedPorts;
  }

  /**
   * Returns the links manager
   * @returns {Manager}
   */
  getLinks() {
    return this.links;
  }

  /**
   * Returns the groups manager
   * @returns {Manager}
   */
  getGroups() {
    return this.groups;
  }

  /**
   * Returns the parameters manager
   * @returns {Manager}
   */
  getParameters() {
    return this.parameters;
  }

  /**
   * Returns the scope property
   * @returns {string}
   */
  getScope() {
    return Flow.SCOPE;
  }

  /**
   * Returns the extension property
   * @returns {string}
   */
  getFileExtension() {
    return Flow.EXTENSION;
  }

  /**
   * Updates the properties of the instance
   * @param {object} json : The data to update the instance
   * @returns {Flow} : The instance
   */
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

  /**
   * Add a new link
   * @param {array} link : Link with format [<from>, <to>]
   */
  addLink(link) {
    const [from, to] = link;
    const id = randomId();

    this.getLinks().setItem({ name: id, content: { from, to } });

    const links = this.getLinks().serializeToDB();

    return { id, ...links[id] };
  }

  /**
   * Set link dependency level
   * @param {string} linkId : Link ID
   * @param {number} dependecyLevel : Dependency level
   */
  setLinkDependency(linkId, dependecyLevel) {
    this.getLinks().getItem(linkId).setDependency(dependecyLevel);
  }

  /**
   *
   * @param {*} linkId
   * @returns
   */
  getLinkDependency(linkId) {
    return this.getLinks().getItem(linkId).getDependency();
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
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

  /**
   * Returns the instance properties serialized
   * @returns {object}
   */
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
   * Returns the instance properties serialized to
   * the database format
   * @returns {object}
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
      Layers: this.getGroups().serializeToDB(),
      Parameter: this.getParameters().serializeToDB()
    };
  }

  //========================================================================================
  /*                                                                                      *
   *                                        Static                                        *
   *                                                                                      */
  //========================================================================================

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

  static OBSERVABLE_KEYS = {
    NAME: "name",
    DETAILS: "details",
    DESCRIPTION: "description"
  };
}

Flow.defaults = {};

export default Flow;
