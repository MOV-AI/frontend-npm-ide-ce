import lodash from "lodash";
import BaseNode from "./BaseNode";
import { convert_visualization } from "../Utils";
import Flows from "../../../Subscribers/Flows";
import { NodesDB } from "../../../toRemove/api/NodesDB";

/**
 * BaseContainerNode: Class containing all base properties and methods
 *  used for ContainerNode and TreeContainerNode
 */
class BaseContainerNode extends BaseNode {
  constructor(canvas, node, events, template) {
    super(canvas, node, events);
    // container node's data
    this.data = {
      id: node.id,
      ContainerLabel: node.ContainerLabel || "",
      ContainerFlow: node.ContainerFlow || "",
      name: node.ContainerLabel, // standard way to get NodeLabel, StateLabel, ContainerLabel
      Visualization: convert_visualization(node.Visualization) || [50, 50],
      Parameter: node.Parameter || {},
      type: "Container",
      model: "Flow"
    };
    this.required_keys = ["ContainerFlow", "ContainerLabel", "Visualization"];
    this._template = template;

    // get a Flows instance
    this._flowsDb = new Flows();
  }

  /**
   * name - returns the container's label
   *
   * @returns {string} the container's label
   */
  get name() {
    return this.data.ContainerLabel;
  }

  /**
   * template_name - returns the container's associated flow name
   *
   * @returns {string} the flow name
   */
  get template_name() {
    return this.data.ContainerFlow;
  }

  /**
   * @override _loadTemplate from BaseNode
   * _loadTemplate - load the node template
   *
   * @returns instance;
   */

  _loadTemplate() {
    // when adding a new Container the subscriber sends a message per key
    // it may happen that we do not have the ContainerFlow yet so we skip the
    // request to load the template
    if (!this.data.ContainerFlow) return this;

    // Remove flow from cache if local template is undefined
    // This force to fetch the flow to get updated changes
    if (!this._template) this._flowsDb.removeFlow(this.data.ContainerFlow);

    this._flowsDb
      .agetFlow(this.data.ContainerFlow)
      .then(data => {
        this._template = data[0]?.value || data[0] || {};
      })
      .then(() => lodash.set(this._template, "template.Type", "MovAI/Flow"))
      .then(() => this._updateTemplate())
      .catch(error => console.error(error));

    return this;
  }

  /**
   * getExposedName - returns the node's template name
   *
   * @returns {string} container exposed name has the prefix __
   */
  getExposedName() {
    return `__${this.template_name}`;
  }

  /**
   * cacheNodeTemplates - Cache nodes in NodesDB
   *
   * @returns {Promise} Resolved after getting all nodes in templates list
   */
  static async cacheNodeTemplates(templates) {
    const _nodesDb = new NodesDB();
    const promises = templates.map(template => {
      return _nodesDb.agetTemplate("node", template);
    });
    return await Promise.allSettled(promises).catch(error =>
      console.log(error)
    );
  }
}

export default BaseContainerNode;
