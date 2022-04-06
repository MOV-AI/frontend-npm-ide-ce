/**
 * Rules for a valid flow
 *
 * 1 - The flow should have at least one link from the start node
 * 2 - @TODO Check cross-talk
 *
 */

import i18n from "../../../../../../i18n/i18n";
import { ROS_VALID_NAMES } from "../../../../../../utils/Constants";
import { DEFAULT_FUNCTION } from "../../../../../../utils/Utils";
import { MisMatchMessageLink } from "../../Components/Links/Errors";
import { isLinkeable } from "../../Components/Nodes/BaseNode/PortValidator";

const messages = {
  startLink: {
    message: i18n.t("Start link(s) not found"),
    type: "warning",
    isRuntime: true,
    isPersistent: false
  },
  linkMismatchMessage: {
    message: i18n.t("There're links with message mismatch"),
    type: "warning",
    isRuntime: false,
    isPersistent: true
  }
};

export default class GraphValidator {
  constructor(graph) {
    this.graph = graph;
  }

  /**
   * @private check if links to the start node
   * @param {object} link object
   *
   * @returns {bool}
   */
  isLinkFromStart = link => {
    return link.data.sourceNode === "start";
  };

  /**
   * @private
   * Validate links in graph
   *  Rule nr. 1 : Missing start link
   *  Rule nr. 2 : Links between ports with different message types
   * @returns {Array} warnings objects
   */
  validateLinks = () => {
    const warnings = [];
    const links = this.graph.links;
    const nodes = this.graph.nodes;
    let linksStart = false;
    let linksMismatches = false;

    links.forEach((link, _, _links) => {
      const linkData = link.data;
      linksStart = linksStart || this.isLinkFromStart(link);

      // Validate ports here
      const noPortsError = GraphValidator.validatePorts(linkData, nodes);

      if (Boolean(noPortsError)) {
        this.graph.deleteLinks([linkData.id]);
        this.graph.invalidLinks.push(linkData);
        return;
      }

      // Validate links message mismatch
      const error = GraphValidator.validateLinkMismatch(linkData, nodes);
      link.updateError(error);
      if (!linksMismatches)
        linksMismatches = link.error instanceof MisMatchMessageLink;
    });

    // Check rule nr. 1 : Missing start link
    if (!linksStart) warnings.push(messages.startLink);
    // Check rule nr. 2 : Links between ports with different message types
    if (linksMismatches) warnings.push(messages.linkMismatchMessage);

    this.addDeletedLinks();

    return warnings;
  };

  addDeletedLinks = () => {
    this.graph.invalidLinks.forEach(invalidLink => {
      this.graph.addLink({
        ...invalidLink,
        From: `${invalidLink.sourceNode}/${invalidLink.sourcePort}`,
        To: `${invalidLink.targetNode}/${invalidLink.targetPort}`
      });
    });
  };

  /**
   * @private
   * Validate if the flow contains any sub-flow with invalid params
   *  - Invalid params: params set on instance and not set on template
   *
   * @returns {Array} List of container id that has invalid params
   */
  validateContainerParams = () => {
    const invalidContainers = new Map();
    const containers = new Map(
      [...this.graph.nodes].filter(
        ([_, node]) => node.obj.data.type === "Container"
      )
    );
    containers.forEach(container => {
      const containerNode = container.obj;
      const instanceParams = containerNode?.data?.Parameter ?? {};
      const templateParams = containerNode?._template?.Parameter ?? {};
      for (const param in instanceParams) {
        if (!Object.hasOwnProperty.call(templateParams, param)) {
          invalidContainers.set(containerNode.data.id, containerNode);
        }
      }
    });
    // return containers id
    return [...invalidContainers.keys()];
  };

  /**
   * run validation rules
   *
   * @returns {Object}
   *  warnings: array with warning messages
   *  invalidContainers: array with containers id with invalid params
   */
  validateFlow = () => {
    const warnings = this.validateLinks();
    const invalidContainersParam = this.validateContainerParams();
    return { warnings, invalidContainersParam };
  };

  /**
   * Validates the given name to add a new instance
   * 1 - should be unique
   * 2 - should pass regex test
   * @param {name} string : New name for this instance
   * @param {instType} string : Type of instance (Node/Sub-flow)
   * @returns {object} {result <bool>, error <string>}
   */
  validateNodeName = (newName, instType) => {
    try {
      const re = ROS_VALID_NAMES;
      if (!newName)
        throw new Error(
          i18n.t("{{instance}} name is mandatory", { instance: instType })
        );
      if (!re.test(newName))
        throw new Error(
          i18n.t("Invalid {{instance}} name", { instance: instType })
        );
      if (this.graph.nodes.has(newName))
        throw new Error(
          i18n.t("Cannot have multiple instances with same name")
        );

      return { result: true, error: "" };
    } catch (err) {
      return {
        result: false,
        error: err.message
      };
    }
  };

  /**
   * Extract the Ports Position of Nodes from link
   * @param {object} link : link object to get the node ports position
   * @param {array} nodes : Array of nodes to get ports position
   * @returns
   */
  static extractLinkPortsPos = (link, nodes) => {
    const [sourceNode, targetNode] = ["sourceNode", "targetNode"].map(key => {
      const node = nodes.get(link[key]);
      if (!node) throw new Error(`Node ${link[key]} not found`);
      return node;
    });

    const sourcePortPos = sourceNode.obj.getPortPos(link.sourcePort);
    const targetPortPos = targetNode.obj.getPortPos(link.targetPort);

    return { sourcePortPos, targetPortPos };
  };

  /**
   * Validate ports : check if both ports exist for a link to co-exist
   * @param {object} link : link object to use to validate ports
   * @param {array} nodes : Array of nodes to get ports position and validate them
   */
  static validatePorts = (link, nodes) => {
    const { sourcePortPos, targetPortPos } = GraphValidator.extractLinkPortsPos(
      link,
      nodes
    );

    if (!sourcePortPos || !targetPortPos) {
      return "Ports not found";
    }
  };

  /**
   * validateLinkMismatch : check if link has message type mismatch
   * @param {*} link : parsed link object
   * @param {*} nodes : graph nodes
   * @returns null or error MisMatchMessageLink object
   */
  static validateLinkMismatch = (link, nodes) => {
    const { sourcePortPos, targetPortPos } = GraphValidator.extractLinkPortsPos(
      link,
      nodes
    );

    // Check if it still has source/target ports
    if (!sourcePortPos || !targetPortPos) return;

    // Check if link is invalid to define error
    const error = !isLinkeable(sourcePortPos.data, targetPortPos.data)
      ? new MisMatchMessageLink(
          link,
          { source: sourcePortPos, target: targetPortPos },
          () => DEFAULT_FUNCTION("")
        )
      : null;

    link.error = error;
    // Return error
    return error;
  };
}
