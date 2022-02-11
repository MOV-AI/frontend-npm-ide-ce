import { randomId } from "../../utils/Utils";
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
import IdBasedManager from "../subModels/IdBasedModel/IdBasedManager";
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
  groups = new IdBasedManager("groups", Group, this.propEvents);
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
   * Returns the node instance item requested
   * @param {String} nodeId : the id of the item we're getting
   * @returns {Manager}
   */
  getNodeInstanceItem(nodeId) {
    return this.nodeInstances.getItem(nodeId);
  }

  /**
   * Returns the sub-flows manager
   * @returns {Manager}
   */
  getSubFlows() {
    return this.subFlows;
  }

  /**
   * Returns the sub flow item requested
   * @param {String} flowId : the id of the item we're getting
   * @returns {Manager}
   */
  getSubFlowItem(flowId) {
    return this.subFlows.getItem(flowId);
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
   * @returns {IdBasedManager}
   */
  getGroups() {
    return this.groups;
  }

  /**
   * Returns a group
   * @param {String} groupId : the id of the group to retrieve
   * @returns {Group}
   */
  getGroup(groupId) {
    return this.groups.getItem(groupId);
  }

  /**
   * Adds a new Group
   * @param {String} groupName : The name of the group to be added
   * @returns {Flow}
   */
  addGroup(groupName) {
    const groupId = randomId();
    this.groups.setItem({
      name: groupId,
      content: { id: groupId, name: groupName, enabled: true }
    });
    return this;
  }

  /**
   * Deletes a group
   * @param {String} groupId : The id of the group to be deleted
   * @returns {Flow}
   */
  deleteGroup(groupId) {
    this.groups.deleteItem(groupId);
    return this;
  }

  /**
   * Toggles a group visibility
   * @param {String} groupId : The id of the group to toggle the visibility
   * @returns {Flow}
   */
  toggleGroupVisibility(groupId, enabled) {
    const thisGroup = this.getGroup(groupId);
    this.groups.updateItem({
      name: groupId,
      content: { ...thisGroup, enabled }
    });
    return this;
  }

  /**
   * Rename group
   * @param {String} groupId : The id of the group to edit
   * @param {Object} content : The content to replace on the group
   * @returns {Flow}
   */
  editGroup(groupId, content = {}) {
    const thisGroup = this.getGroup(groupId);
    this.groups.updateItem({
      name: groupId,
      content: { ...thisGroup, ...content }
    });
    return this;
  }

  /**
   * Returns the parameters manager
   * @returns {Manager}
   */
  getParameters() {
    return this.parameters;
  }

  /**
   * Returns the parameter
   * @param {String} paramId : The id of the parameter to retrieve
   * @returns {Parameter}
   */
  getParameter(paramId) {
    return this.parameters.getItem(paramId);
  }

  /**
   * Adds a new Parameter
   * @returns {Manager}
   */
  addParameter(name, content) {
    this.parameters.setItem({ name, content });
    return this;
  }

  /**
   * Deletes a parameter
   * @param {string} paramId : The id of the parameter to be deleted
   * @returns {Flow}
   */
  deleteParameter(paramId) {
    this.parameters.deleteItem(paramId);
    return this;
  }

  /**
   * Updates an instance of a managed property
   * Can only be used with managed properties
   * @param {string} propName : The name of the property
   * @param {object} content : The data to update the item
   * @param {string} prevName : Previous item name
   * @returns {Node} : The instance
   */
  updateKeyValueItem(propName, content, prevName) {
    const name = content.name;
    if (prevName !== name) {
      this[propName].renameItem({ prevName, name }, true);
    }

    this[propName].updateItem({ name, content });
    return this;
  }

  /**
   * Deletes an instance of a managed property
   * Can only be used with managed properties
   * @param {string} varName : The name of the property
   * @param {any} key : The name of the item
   * @returns {Node} : The instance
   */
  deleteKeyValue(varName, key) {
    this[varName].deleteItem(key);
    return this;
  }

  /**
   * Returns an instance of a managed property
   * Can only be used with managed properties
   * @param {string} varName : The name of the property
   * @param {any} key : The name of the item
   * @returns {any}
   */
  getKeyValue(varName, key) {
    return this[varName].getItem(key);
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

  addNode(node) {
    const { name } = node;
    const content = NodeInstance.serializeOfDB({ [name]: { ...node } });
    this.getNodeInstances().setItem({ name, content });
  }

  addSubFlow(node) {
    const { name } = node;
    const content = SubFlow.serializeOfDB({ [name]: { ...node } });
    this.getSubFlows().setItem({ name, content });
  }

  /**
   * Deletes a node instance and connected links
   * @param {string} nodeId : The node instance id
   * @returns {boolean} : True on success, false otherwise
   */
  deleteNode(nodeId) {
    this.deleteNodeLinks(nodeId);
    return this.getNodeInstances().deleteItem(nodeId);
  }

  /**
   * Deletes a sub flow and connected links
   * @param {string} subFlowId : The sub flow id
   * @returns {boolean} : True on success, false otherwise
   */
  deleteSubFlow(subFlowId) {
    this.deleteNodeLinks(subFlowId);
    return this.getSubFlows().deleteItem(subFlowId);
  }

  /**
   * Deletes links connected to the node (nodeInst or subFlow)
   * @param {string} id : The node (nodeInst or subFlow) id
   * @returns
   */
  deleteNodeLinks = id => {
    const deletedLinks = [];

    // delete all links connected to the node
    this.getLinks().data.forEach((item, key) => {
      // check if the link belongs to the node
      if (item.getNodes().includes(id)) {
        this.deleteLink(key);

        deletedLinks.push(key);
      }
    });

    return deletedLinks;
  };

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

  deleteLink(id) {
    this.getLinks().deleteItem(id);
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

  toggleExposedPort(templateName, nodeName, portName) {
    this.getExposedPorts().toggleExposedPort(templateName, nodeName, portName);
    return this.getExposedPorts().serializeToDB();
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

    // TODO method is just a temporary fix. https://movai.atlassian.net/browse/BP-465
    const getValueToSave = manager => {
      return manager.hasItems() ? manager.serializeToDB() : undefined;
    };

    return {
      Label: name,
      Description: description,
      LastUpdate: details,
      NodeInst: this.getNodeInstances().serializeToDB(),
      Container: this.getSubFlows().serializeToDB(),
      ExposedPorts: getValueToSave(this.getExposedPorts()),
      Links: getValueToSave(this.getLinks()),
      Layers: getValueToSave(this.getGroups()),
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
