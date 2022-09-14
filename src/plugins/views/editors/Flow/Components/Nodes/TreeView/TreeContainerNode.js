import TreeNode from "../BaseNode/TreeView/TreeNode";
import BaseContainerNode from "../BaseNode/BaseContainerNode";
import CollapsableItem from "../BaseNode/TreeView/CollapsableItem";
import { TYPES } from "../../../Constants/constants";

const RENDERING_MODE = {
  tree: 0,
  spread: 1
};

class TreeContainerNode extends TreeNode {
  constructor({ canvas, node, events, template, parent }) {
    super({ canvas, node, events, _type: TYPES.CONTAINER, template, parent });
    this.childrenLinks = new Map();
    this._collapsableItem = null;
    this._displayChildren = true;
    this._timerToUpdateHeader = null;
    this._renderingMode = RENDERING_MODE.spread;
    // Inherit attributes/methods from BaseContainerNode
    this.base = new BaseContainerNode({ canvas, node, events, template });
    this.data = this.base.data;
    this._template = this.base._template;
    this.getExposedName = this.base.getExposedName;
    this._addPorts = () => this;
    this.isContainer = true;

    // initialize the container
    this.init();
  }

  //========================================================================================
  /*                                                                                      *
   *                                Getters & Setters                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * name - returns the container's label
   *
   * @returns {string} the container's label
   */
  get name() {
    return this.base.name;
  }

  /**
   * @override
   * templateName - returns the container's associated flow name
   *
   * @returns {string} the flow name
   */
  get templateName() {
    return this.base.templateName;
  }

  /**
   * collapsableItem - returns collapsable item
   *
   * @returns {CollapsableItem} Nodes children collapsable container
   */
  get collapsableItem() {
    return this._collapsableItem;
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * renderNodesHeader: Render children nodes collapsable header
   * @private
   * @returns {TreeContainerNode} instance
   */
  renderNodesHeader() {
    if (this._collapsableItem) return;
    // Render header
    this._collapsableItem = new CollapsableItem({
      text: "NODES",
      isExpanded: this._displayChildren,
      parent: this.parent
    });
    // Add header to main object
    this.object.append(() => {
      return this._collapsableItem.el;
    });
    // Return instance
    return this;
  }

  /**
   * updateChildrenBelongLines: Update all nodes belong lines (remove/re-draw)
   * @private
   * @param {Map<string,TreeNode>} children : Map of children
   */
  updateChildrenBelongLines(children = this.children) {
    children.forEach(child => {
      child.updateBelongLines();
      this.updateChildrenBelongLines(child.children);
    });
  }

  /**
   * @override getBelongLinePoints
   * @param {Object} offset: {x, y}
   * @param {Object} childPos: {x, y}
   * @param {Object} parentPos: {x, y}
   * @returns {Array} Containing x and y lines with x1,y1,x2,y2 points to be drawn
   */
  getBelongLinePoints(offset, childPos, parentPos) {
    if (this._renderingMode === RENDERING_MODE.tree)
      return super.getBelongLinePoints(offset, childPos, parentPos);
    const lineX = {
      x1: parentPos.x - offset.x + this.width + this.padding.x / 2,
      y1: parentPos.y - offset.y + this.height / 2 + this.padding.y / 2,
      x2: childPos.x - offset.x + this.width / 2 + this.padding.x / 2,
      y2: parentPos.y - offset.y + this.height / 2 + this.padding.y / 2
    };
    const lineY = {
      x1: lineX.x2,
      y1: lineX.y2,
      x2: lineX.x2,
      y2: childPos.y - offset.y + this.padding.y
    };
    return [lineX, lineY];
  }

  /**
   * Position children based on the rendering mode
   * @private
   * @param {String} mode: one of RENDERING_MODE values
   */
  positionChildren(mode) {
    const positioner = {
      [RENDERING_MODE.tree]: () => {
        let childrenHeightSum = 0;
        this.children.forEach(node => {
          node.updatePortsPosition();
          node.object.attr("y", childrenHeightSum);
          childrenHeightSum += node.el.getBBox().height + 20;
        });
      },
      [RENDERING_MODE.spread]: () => {
        let childrenHeightSum = 0;
        let maxWidthNode = 0;
        this.children.forEach(node => {
          node.updatePortsPosition();
          const nodeWidth = node.el.getBBox().width;
          const nodeHeight = node.el.getBBox().height;
          if (node.data.type !== TYPES.CONTAINER) {
            if (maxWidthNode < nodeWidth) maxWidthNode = nodeWidth;
            node.object.attr("y", childrenHeightSum);
          } else {
            node.object.attr("x", maxWidthNode);
            maxWidthNode += nodeWidth + 20;
          }
          childrenHeightSum += nodeHeight + 20;
        });
      }
    };
    return positioner[mode]();
  }

  //========================================================================================
  /*                                                                                      *
   *                                 Public methods                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * renderChild: Add node to children container d3 object in collapsable item
   *
   * @param {TreeNode} child: Node child
   */
  renderChild(child) {
    // Unset width/height
    this.object.attr("width", null).attr("height", null);
    // Align and Render child
    child.updatePosition(-15);
    this._collapsableItem.addChild(child);
  }

  /**
   * Re-position child nodes in parent
   *
   * @param {boolean} is2updateParent: Flag to indicate if it should re-position nodes from parent
   */
  updateChildrenPosition(is2updateParent = true) {
    this.positionChildren(this._renderingMode);
    if (this.parent && is2updateParent) this.parent.updateChildrenPosition();
    if (!this.parent) this.updateChildrenBelongLines();
  }

  /**
   * Add node as its child
   *
   * @param {TreeNode} node: Child node
   *  (TreeClassicNode/TreeContainerNode/TreeStateNode)
   */
  addChild(node) {
    // Add node to child list
    this.children.push(node);
    // Render nodes collapsable header
    this.renderNodesHeader();
  }
}

export default TreeContainerNode;
