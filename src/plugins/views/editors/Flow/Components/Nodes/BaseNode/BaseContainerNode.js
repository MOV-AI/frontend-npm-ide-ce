import BaseNode from "./BaseNode";
import { convertVisualization } from "../Utils";

/**
 * BaseContainerNode: Class containing all base properties and methods
 *  used for ContainerNode and TreeContainerNode
 */
class BaseContainerNode extends BaseNode {
  constructor({ canvas, node, events, template }) {
    const templateType = "MovAI/Flow";
    super({
      canvas,
      node,
      events,
      template: { ...template, Type: templateType }
    });
    // container node's data
    this.data = {
      id: node.id,
      ContainerLabel: node.ContainerLabel || "",
      ContainerFlow: node.ContainerFlow || "",
      name: node.ContainerLabel, // standard way to get NodeLabel, StateLabel, ContainerLabel
      Visualization: convertVisualization(node.Visualization) || [50, 50],
      Parameter: node.Parameter || {},
      type: "Container",
      model: "Flow"
    };
    this.requiredKeys = ["ContainerFlow", "ContainerLabel", "Visualization"];
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
   * templateName - returns the container's associated flow name
   *
   * @returns {string} the flow name
   */
  get templateName() {
    return this.data.ContainerFlow;
  }

  /**
   * getExposedName - returns the node's template name
   *
   * @returns {string} container exposed name has the prefix __
   */
  getExposedName() {
    return `__${this.templateName}`;
  }
}

export default BaseContainerNode;
