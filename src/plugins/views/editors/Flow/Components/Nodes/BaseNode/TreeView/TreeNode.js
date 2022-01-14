import * as d3 from "d3";
import _debounce from "lodash/debounce";
import BaseNode from "../BaseNode";
import TreeNodeHeader from "./TreeNodeHeader";
import TreeNodePort from "./TreeNodePort";
import CollapsableItem from "./CollapsableItem";
import { belongLineBuilder } from "../../Utils";
import BaseNodeStatus from "../BaseNodeStatus";

class TreeNode extends BaseNode {
  constructor(canvas, node, events, _type, template, parent) {
    super(canvas, node, events, _type, template);
    this.parent = parent;
    this.children = new Map();
    this._links = new Map();
    this._displayPorts = false;
    this._collapsablePorts = null;
    this._belongLine = null;
  }

  //========================================================================================
  /*                                                                                      *
   *                                 Private methods                                      *
   *                                                                                      */
  //========================================================================================

  /**
   * @private
   * @override init: initialize the node element
   */
  init() {
    this.renderBody()
      .renderHeader()
      .renderStatus()
      .addPorts((node, data, events) => new TreeNodePort(node, data, events))
      .renderPortsHeader()
      .addEvents();

    return this;
  }

  /**
   * @override renderHeader - render the node header
   */
  renderHeader() {
    // header already exists; probably an update request;
    if (this._header) this._header.destroy();

    // create the node header instance
    this._header = new TreeNodeHeader(
      this.headerPos.x,
      this.headerPos.y,
      this.name,
      this.template_name,
      this._type
    );

    // append to the svg element
    this.object.append(() => {
      return this._header.el;
    });

    return this;
  }

  /**
   * renderPortsHeader - render the ports collapsable header
   */
  renderPortsHeader() {
    if (this._collapsablePorts) this._collapsablePorts.destroy();

    if (this._ports.size) {
      // Render ports header
      this._collapsablePorts = new CollapsableItem({
        text: "PORTS",
        isExpanded: this._displayPorts,
        parent: this.parent,
        onToggleCollapsePorts: this.onToggleCollapsePorts
      });
      // Add ports header to node
      this.object.append(() => {
        return this._collapsablePorts.el;
      });
      // Order ports in/out
      this._ports = new Map(
        [...this._ports.entries()].sort(([_aKey, a], [_bKey, b]) => {
          return a.data.type.localeCompare(b.data.type);
        })
      );
      // Add ports to header container
      this._ports.forEach(port => {
        this._collapsablePorts.addChild(port);
      });
    }

    return this;
  }

  /**
   * renderStatus - render the status of the node (circle on the body)
   */
  renderStatus = () => {
    const currentStatus = this.status;
    // status already exists; probably an update request;
    if (this._status) this._status.destroy();

    // create the node status instance with fixed position
    this._status = new BaseNodeStatus(37.5, 28);

    // append to the svg element
    this.object.append(() => {
      return this._status.el;
    });

    // Reset status to its original value
    this.status = currentStatus;

    return this;
  };

  /**
   * @override _updatePosition: Update x and y position of main svg object
   */
  _updatePosition(x = 0, y = 0) {
    this.object.attr("x", x).attr("y", y);
  }

  /**
   * @override update - update graphical representation
   */
  update = (addLinks = false) => {
    this.addPorts((node, data, events) => new TreeNodePort(node, data, events))
      ._renderPortsHeader()
      .renderStatus();

    if (addLinks) this.updateLinks();
    return this;
  };

  /**
   * getAbsolutePosition: Get fixed absolute node position regardless of transformation
   *
   * @param {TreeNode} node: Node instance to get position
   */
  getAbsolutePosition(node) {
    let nodePosX = parseFloat(node.object.attr("x"));
    let nodePosY = parseFloat(node.object.attr("y"));
    if (node.parent) {
      const { x, y } = this.getAbsolutePosition(node.parent);
      const nodeContainer = node.el.parentElement;
      const parentContainer = nodeContainer.parentElement;
      nodePosX +=
        x + nodeContainer.x.baseVal.value + parentContainer.x.baseVal.value;
      nodePosY +=
        y + nodeContainer.y.baseVal.value + parentContainer.y.baseVal.value;
    }
    return { x: nodePosX, y: nodePosY };
  }

  /**
   * Get x and y lines to draw belong lines
   * @param {Object} offset: {x, y}
   * @param {Object} childPos: {x, y}
   * @param {Object} parentPos: {x, y}
   * @returns {Array} Containing x and y lines with x1,y1,x2,y2 points to be drawn
   */
  _getBelongLinePoints(offset, childPos, parentPos) {
    const lineY = {
      x1: parentPos.x - offset.x + this.width / 2 + this.padding.x / 2,
      y1: parentPos.y - offset.y + this.height + this.padding.y,
      x2: parentPos.x - offset.x + this.width / 2 + this.padding.x / 2,
      y2: childPos.y - offset.y + this.width / 2
    };
    const lineX = {
      x1: lineY.x2,
      y1: lineY.y2,
      x2: lineY.x2 + this.padding.x / 2,
      y2: lineY.y2
    };
    return [lineX, lineY];
  }

  /**
   * _getRootNode: Get root node (initial flow node)
   *  - Iterate recursively on the tree to find the node without parent (root node)
   *
   * @param {TreeNode} node: Can be any node in the tree
   */
  _getRootNode(node = this) {
    if (!node.parent) return node;
    return this._getRootNode(node.parent);
  }

  /**
   * Find TreeNode that is rendered right before this node
   * @returns {TreeNode} Tree node object right before this node
   */
  _getPreviousBrother() {
    let previousBrother = this.parent;
    const siblings = [...this.parent.children.keys()];
    siblings.forEach((sibling, index) => {
      const nextSibling = siblings[index + 1];
      const siblingNode = this.parent.children.get(sibling);
      if (
        nextSibling === this.data.id &&
        siblingNode.data.type === this.data.type
      )
        previousBrother = siblingNode;
    });
    return previousBrother;
  }

  /**
   * Get position to be used as reference to draw belong lines
   * @param {*} parentPos : Object containing x/y position of parent node
   * @param {*} previousBrotherPos : Object containing x/y position of previous sibling node
   * @returns {Object} Position {x : number, y: number}
   */
  _getReferenceOriginPos = (parentPos, previousBrotherPos) => {
    // To avoid lines drawn on top of others
    previousBrotherPos.x -= this.width / 2;
    previousBrotherPos.y += this.padding.x - this.padding.y - this.height;
    // Get reference position based on node type
    const position = {
      Container: {
        x: previousBrotherPos.x,
        y: parentPos.y
      },
      NodeInst: {
        x: parentPos.x,
        y: previousBrotherPos.y
      },
      State: {
        x: parentPos.x,
        y: previousBrotherPos.y
      }
    };
    // Return position
    return position[this.data.type];
  };

  /**
   * @override _eventsOn - call the function if the node's events are enabled
   *  - Exclude events on external elements that aren't inside the main node rect
   *
   * @param {function} fn function to call if the node's events are enabled
   */
  eventsOn = fn => {
    // Exit function if click is not on clickable area to select/unselect
    const targetClasses = d3.event.target.className.baseVal;
    if (!targetClasses.includes("node-inst-click-area")) return;
    // Execute function if node is visible
    if (this.visible) fn();
  };

  onToggleCollapsePorts = () => {
    this._displayPorts = !this._displayPorts;
  };

  /**
   * Reload node to update cache
   */
  updateLinks = _debounce(() => {
    this._links.forEach(link => {
      this.addLink(link);
    });
  }, 500);

  /**
   * Get source and target ports of link
   * @param {Object} link : Link info
   * @returns Source/Target ports objects
   */
  getLinkPorts = link => {
    const sourceCount = link.sourceFullPath.length - 1;
    const targetCount = link.targetFullPath.length - 1;
    const finalSourcePort = this.formatPort(link, "sourcePort", sourceCount);
    const finalTargetPort = this.formatPort(link, "targetPort", targetCount);
    const sourcePort = this._ports.get(finalSourcePort);
    const targetPort = this._ports.get(finalTargetPort);
    return { sourcePort, targetPort };
  };

  /**
   * Removes all parent's name from target/source ports
   *
   * @param {Object} link : Link information
   * @param {String} direction : "sourcePort" or "targetPort"
   * @param {Integer} count : Quantity of parents involved
   * @returns {String} Target/Source port without its parents
   */
  formatPort = (link, direction, count) => {
    return link[direction].split("/").splice(count).join("/");
  };

  /**
   * Check if the link information actually belongs to the node
   *
   * @param {Object} link : Link information
   * @param {String} direction : "sourceNode" or "targetNode"
   * @returns {Boolean} True if valid, false otherwise
   */
  checkLink = (link, direction) => {
    return (
      link[direction] === this.data.id ||
      link[direction] === this.parent?.data?.id
    );
  };

  /**
   * Checks if node is being rendered in canvas by checking if parent node is expanded recursively
   * @param {TreeNode} node : TreeNode object
   * @returns {Boolean} True if node is being rendered in canvas and False otherwise
   */
  isParentExpanded = (node = this) => {
    let isExpanded = node.parent?.collapsableItem?.isExpanded;
    if (node?.parent?.parent && isExpanded) {
      isExpanded = this.isParentExpanded(node.parent);
    }
    return isExpanded;
  };

  //========================================================================================
  /*                                                                                      *
   *                                Getters & Setters                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * @override headerPos - get the position of the header
   * @returns {object} object with the header position {x: val, y: val}
   */
  get headerPos() {
    return {
      x: this.width + this.padding.x,
      y: 0
    };
  }

  /**
   * Set loading status of node (transition status between active/stopped)
   */
  set statusLoading(val) {
    this._status.statusLoading = val;
  }

  /**
   * Return node status : True if not loading and False otherwise
   * @returns {Boolean} Inform if node is ready to be manually set active/stopped
   */
  get isReady() {
    return this._status.isReady;
  }

  /**
   * Return node links
   * @returns {Map} All links in node
   */
  get links() {
    return this._links;
  }

  //========================================================================================
  /*                                                                                      *
   *                                 Public methods                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * onTemplateUpdate - on template update event handler
   * templates only change when edited while in redis
   *
   * @param {string} template_name node's template name
   */
  onTemplateUpdate = template_name => {
    if (template_name !== this.template_name) return; //not my template
    this._template = undefined;
    this._update(true);
  };

  /**
   * Set canvas mode onDblClick to open template of miniature
   *
   * @param {Object} mini : Miniature node object
   */
  onDblClickMini = mini => {
    // doesn't trigger dblclick if model is empty
    if (!mini.model) return;
    // get data to trigger dblclick
    const dummyNode = {
      _template: { url: mini.name, name: mini.name },
      data: { model: mini.model, type: mini.nodeType }
    };
    // set mode to double click
    this.canvas.setMode("onDblClick", { node: dummyNode }, true);
  };

  /**
   * Gets relative path from main flow to node
   *
   * @param {Array} name : Relative path from main flow
   * @returns {String} Eg: subflow1__subflow2__nodeName
   */
  getNodePath(name = []) {
    if (this.parent) {
      name.unshift(this.name);
      return this.parent.getNodePath(name);
    } else {
      return name.join("__");
    }
  }

  /**
   * @override addToCanvas - append node element to canvas
   */
  addToCanvas() {
    if (this.parent) {
      this.parent.renderChild(this);
    } else {
      this.canvas.append(() => {
        this.object.attr("x", 50).attr("y", 50);
        return this.el;
      });
    }
  }

  /**
   * addLink - Add link information to correspondent port (source/target)
   *
   * @param {Object} link: parsed link information
   */
  addLink(link) {
    const { sourcePort, targetPort } = this.getLinkPorts(link);
    if (sourcePort && this.checkLink(link, "sourceNode")) {
      sourcePort.addLink(link);
      this.parent.childrenLinks.set(link.id, link);
    }
    if (targetPort && this.checkLink(link, "targetNode")) {
      targetPort.addLink(link);
      this.parent.childrenLinks.set(link.id, link);
    }
    // Add to local link map
    this._links.set(link.id, link);
  }

  /**
   * Remove link info from node port
   *
   * @param {Object} link : Link info
   */
  removeLink(link) {
    const { sourcePort, targetPort } = this.getLinkPorts(link);
    if (sourcePort) sourcePort.removeLink(link);
    if (targetPort) targetPort.removeLink(link);
    // Remove from local link map
    this._links.delete(link.id);
    // Update links
    this.updateLinks();
  }

  /**
   * updatePortsPosition - Update ports position
   */
  updatePortsPosition() {
    // Render ports info
    let portsHeightSum = 0;
    this._ports.forEach(port => {
      port.updateLinksPosition().setPosition(portsHeightSum);
      portsHeightSum += port.el.getBBox().height + 5;
    });
  }

  /**
   * updateBelongLines - Update belong lines (either remove or re-draw)
   */
  updateBelongLines() {
    if (!this.parent) return;
    if (this.isParentExpanded()) {
      this.drawBelongLine();
    } else {
      this.removeBelongLine();
    }
  }

  /**
   * removeBelongLine - Remove belong lines if node is collapsed
   */
  removeBelongLine() {
    if (this._belongLine) this._belongLine.remove();
    this.children.forEach(child => {
      child.removeBelongLine();
    });
  }

  /**
   * drawBelongLine - Draw belong lines to connect node to its parent
   */
  drawBelongLine() {
    if (!this.parent) return;
    if (this._belongLine) this._belongLine.remove();
    const rootNode = this._getRootNode();
    const previousBrother = this._getPreviousBrother();
    const previousBrotherPos = this.getAbsolutePosition(previousBrother);
    const childPos = this.getAbsolutePosition(this);
    const offset = this.getAbsolutePosition(rootNode);
    const parentPos = this.getAbsolutePosition(this.parent);
    const refPos = this._getReferenceOriginPos(parentPos, previousBrotherPos);
    // Build line
    const [lineX, lineY] = this._getBelongLinePoints(offset, childPos, refPos);
    // Create lines container
    this._belongLine = d3
      .create("svg")
      .attr("x", "50")
      .attr("y", "50")
      .attr("class", "belong-lines");
    // Draw lines in container
    this._belongLine.append(() => {
      return belongLineBuilder(lineY);
    });
    this._belongLine.append(() => {
      return belongLineBuilder(lineX);
    });
    // Append belong lines container to links svg container
    this.canvas.links.append(() => {
      return this._belongLine.node();
    });
  }
}

export default TreeNode;
