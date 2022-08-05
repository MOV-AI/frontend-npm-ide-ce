/**
 * Rules for a valid flow
 *
 * 1 - The flow should have at least one link from the start node
 * 2 - @TODO Check cross-talk
 *
 */

import i18n from "../../../../../../i18n/i18n";
import MESSAGES from "../../../../../../utils/Messages";
import {
  ROS_VALID_NAMES,
  ALERT_SEVERITIES
} from "../../../../../../utils/Constants";
import { defaultFunction } from "../../../../../../utils/Utils";
import { MisMatchMessageLink } from "../../Components/Links/Errors";
import { isLinkeable } from "../../Components/Nodes/BaseNode/PortValidator";
import { PARENT_NODE_SEP, TYPES } from "../../Constants/constants";

export const WARNING_TYPES = {
  START_LINK: "startLink",
  LINK_MISMATCH: "linkMismatchMessage",
  INVALID_PARAMETERS: "invalidParameters",
  INVALID_EXPOSED_PORTS: "invalidExposedPorts",
  INVALID_LINKS: "invalidLinks"
};

const WARNINGS = {
  [WARNING_TYPES.START_LINK]: {
    message: i18n.t("StartLinkNotFound"),
    type: ALERT_SEVERITIES.WARNING,
    isRuntime: true,
    isPersistent: false,
    warningType: WARNING_TYPES.START_LINK
  },
  [WARNING_TYPES.LINK_MISMATCH]: {
    message: i18n.t("MessageMismatchedLinks"),
    type: ALERT_SEVERITIES.WARNING,
    isRuntime: false,
    isPersistent: true,
    warningType: WARNING_TYPES.LINK_MISMATCH
  },
  [WARNING_TYPES.INVALID_PARAMETERS]: {
    message: i18n.t("InvalidSubFlowParameters"),
    type: ALERT_SEVERITIES.WARNING,
    isRuntime: false,
    isPersistent: true,
    warningType: WARNING_TYPES.INVALID_PARAMETERS
  },
  [WARNING_TYPES.INVALID_EXPOSED_PORTS]: {
    message: i18n.t("InvalidExposedPorts"),
    type: ALERT_SEVERITIES.WARNING,
    isRuntime: false,
    isPersistent: true,
    warningType: WARNING_TYPES.INVALID_EXPOSED_PORTS
  },
  [WARNING_TYPES.INVALID_LINKS]: {
    message: i18n.t("InvalidLinksFoundTitle"),
    type: ALERT_SEVERITIES.WARNING,
    isRuntime: false,
    isPersistent: true,
    warningType: WARNING_TYPES.INVALID_LINKS
  }
};

export default class GraphValidator {
  constructor(graph) {
    this.graph = graph;
  }

  setWarningActions(warningType, action) {
    if (WARNINGS[warningType]) WARNINGS[warningType].onClick = action;
  }

  removeWarningAction(warningType) {
    if (WARNINGS[warningType]) delete WARNINGS[warningType].onClick;
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
   *  Rule nr. 3 : Links that don't have start or end port
   * @returns {Array} warnings objects
   */
  validateLinks = () => {
    const warnings = [];
    const links = this.graph.links;
    const nodes = this.graph.nodes;
    let linksStart = false;
    let linksMismatches = false;

    this.addDeletedLinks();

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
    if (!linksStart) warnings.push(WARNINGS[WARNING_TYPES.START_LINK]);
    // Check rule nr. 2 : Links between ports with different message types
    if (linksMismatches) warnings.push(WARNINGS[WARNING_TYPES.LINK_MISMATCH]);
    // Check rule nr. 3 : Links that don't have start or end port
    if (this.graph.invalidLinks.length)
      warnings.push({
        ...WARNINGS[WARNING_TYPES.INVALID_LINKS],
        data: this.graph.invalidLinks,
        callback: this.graph.clearInvalidLinks
      });

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
   * Validate if the flow contains any invalid Exposed Ports
   * - Invalid Exposed Ports: Exposed Ports that exist on the Instance but no set on the Template
   *
   * @returns {Array} List of nodes that have invalid Exposed Ports
   */
  validateExposedPorts = () => {
    const warnings = [];
    const invalidExposedPorts = [];
    const exposedPorts = Object.values(this.graph.exposedPorts);

    exposedPorts.forEach(instExposedPorts => {
      Object.entries(instExposedPorts).forEach(
        ([instName, nodeExposedPorts]) => {
          const invalidPorts = [];
          const thisNode = this.graph.nodes.get(instName)?.obj;
          if (!thisNode) return;
          nodeExposedPorts.forEach(exposedPort => {
            if (!thisNode.ports.has(exposedPort)) {
              invalidPorts.push(exposedPort);
            }
          });

          invalidPorts.length &&
            invalidExposedPorts.push({
              nodeInst: thisNode,
              invalidPorts
            });
        }
      );
    });

    invalidExposedPorts.length &&
      warnings.push({
        ...WARNINGS[WARNING_TYPES.INVALID_EXPOSED_PORTS],
        data: invalidExposedPorts
      });

    return warnings;
  };

  /**
   * @private
   * Validate if the flow contains any sub-flow with invalid params
   *  - Invalid params: params set on instance and not set on template
   *
   * @returns {Array} List of container id that has invalid params
   */
  validateContainerParams = () => {
    const invalidContainers = [];
    const invalidParamsWarning = [];
    const containers = new Map(
      [...this.graph.nodes].filter(
        ([_, node]) => node.obj.data.type === TYPES.CONTAINER
      )
    );
    containers.forEach(container => {
      const containerNode = container.obj;
      const instanceParams = containerNode?.data?.Parameter ?? {};
      const templateParams = containerNode?._template?.Parameter ?? {};
      const invalidParams = [];

      for (const param in instanceParams) {
        if (!Object.hasOwnProperty.call(templateParams, param)) {
          invalidParams.push(param);
        }
      }
      invalidParams.length &&
        invalidContainers.push({
          id: containerNode.data.id,
          name: containerNode.data.name,
          containerNode,
          invalidParams
        });
    });

    invalidContainers.length &&
      invalidParamsWarning.push({
        ...WARNINGS[WARNING_TYPES.INVALID_PARAMETERS],
        data: invalidContainers
      });

    // return containers id
    return invalidParamsWarning;
  };

  /**
   * run validation rules
   *
   * @returns {Object}
   *  warnings: array with warning messages
   *  invalidContainers: array with containers id with invalid params
   */
  validateFlow = () => {
    // Gather all warnings
    const invalidLinks = this.validateLinks();
    const invalidExposedPorts = this.validateExposedPorts();
    const invalidParams = this.validateContainerParams();
    // Merge warnings and return them
    const warnings = [
      ...invalidLinks,
      ...invalidExposedPorts,
      ...invalidParams
    ];
    return { warnings };
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
          i18n.t(MESSAGES.ERROR_MESSAGES.INSTANCE_NAME_IS_MANDATORY, {
            instance: instType
          })
        );
      if (!re.test(newName))
        throw new Error(
          i18n.t(MESSAGES.ERROR_MESSAGES.INVALID_INSTANCE_NAME, {
            instance: instType
          })
        );
      if (this.graph.nodes.has(newName))
        throw new Error(
          i18n.t(MESSAGES.ERROR_MESSAGES.MULTIPLE_ENTRIES_WITH_SAME_NAME)
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
  static extractLinkPortsPos = (link, nodes, parent) => {
    const [sourceNode, targetNode] = ["sourceNode", "targetNode"].map(key => {
      const node =
        nodes.get(link[key]) ??
        nodes.get(`${parent?.name}${PARENT_NODE_SEP}${link[key]}`);
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
          () => defaultFunction("")
        )
      : null;

    link.error = error;
    // Return error
    return error;
  };
}
