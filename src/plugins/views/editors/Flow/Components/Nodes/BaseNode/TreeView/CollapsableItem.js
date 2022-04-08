import * as d3 from "d3";
import { defaultFunction } from "../../../../../../../../utils/Utils";
import { Expanded, Collapsed } from "./PortIcons";

class CollapsableItem {
  constructor({
    text,
    isExpanded = true,
    parent = null,
    onToggleCollapsePorts = () => defaultFunction("onToggleCollapsePorts")
  }) {
    this.text = text;
    this.parent = parent;
    this.children = new Map();
    this.isExpanded = isExpanded;
    this.onToggleCollapsePorts = onToggleCollapsePorts;
    this._timerToUpdate = null;
    // SVG objects
    this.object = null;
    this._header = null;
    this._childrenContainer = null;
    // Render header
    this.render();
  }

  /**
   * @private
   * render: render collapsable item with header and children container
   */
  render() {
    // Reset collapsable item
    if (this.object) this.destroy();
    // Create collapsable item
    this.object = d3
      .create("svg")
      .attr("x", "25")
      .attr("y", "65")
      .attr("class", "children-container");
    // Add header
    this.renderHeader();
    // Add children container object
    this.renderChildren();
  }

  /**
   * @private
   * renderHeader: render header used to expand/collapse children
   */
  renderHeader() {
    // Reset header
    if (this._header) this._header.remove();
    this._header = d3
      .create("svg")
      .attr("fill", "white")
      .style("cursor", "pointer");
    // Add expand/collapse icon
    this._header.append(() => {
      if (this.isExpanded) return Expanded.getIcon();
      else return Collapsed.getIcon();
    });
    // Add text
    this._header
      .append("svg:text")
      .attr("x", "25")
      .attr("y", "13")
      .attr("class", "text unselectable")
      .attr("stroke-width", 0)
      .style("font-size", "15px")
      .style("dominant-baseline", "central")
      .text(this.text);
    // Add click event
    this._header.on("click", () => {
      // Toggle collapsed/expanded state
      this.isExpanded = !this.isExpanded;
      this.onToggleCollapsePorts();
      // Update header to toggle expand/collapse icon
      this.renderHeader();
      // Show/Hide children
      if (this.isExpanded) this.renderChildren();
      else this.collapse();
      // Update position
      this.updatePosition();
    });
    // Add header to main object
    this.object.append(() => this._header.node());
  }

  /**
   * @private
   * renderChildren: render children container
   */
  renderChildren() {
    // Reset children container
    if (this._childrenContainer) this._childrenContainer.remove();
    this._childrenContainer = d3
      .create("svg")
      .attr("x", "25")
      .attr("y", "40")
      .attr("class", "children-container");
    if (this.isExpanded) {
      // Add children
      this.children.forEach(child => {
        this._childrenContainer.append(() => {
          return child.el;
        });
      });
    }
    // Add children container to main object
    this.object.append(() => this._childrenContainer.node());
    this.updateBelongLines(this.children);
  }

  /**
   * @private
   * collapse: Collapse children (removing children container)
   */
  collapse() {
    // Remove belong line
    this.children.forEach(child => {
      if (child.removeBelongLine) child.removeBelongLine();
    });
    // Remove children container
    this._childrenContainer.remove();
  }

  /**
   * @private
   * updatePosition: Ask parent (TreeContainerNode) to update its children position
   */
  updatePosition() {
    if (this.parent) this.parent.updateChildrenPosition();
  }

  /**
   * @private
   * updateBelongLines: Update belong lines that connects each nodes with its Container parent
   */
  updateBelongLines(children) {
    // Update belong lines
    if (!children) return;
    children.forEach(child => {
      if (child.updateBelongLines) child.updateBelongLines();
      this.updateBelongLines(child.children);
    });
  }

  /**
   * el: Main svg element node
   *
   * @returns {DOMElement} svg DOM element
   */
  get el() {
    return this.object.node();
  }

  /**
   * destroy: Remove main svg object
   */
  destroy() {
    this.object.remove();
  }

  /**
   * addChild: Add child to children container
   *
   * @param {TreeNode} child: The child node is an instance of one of the following:
   *  TreeContainerNode/TreeClassicNode/TreeStateNode
   */
  addChild(child) {
    const index = this.children.size + 1;
    this.children.set(index, child);
    if (this.isExpanded) {
      this._childrenContainer.append(() => {
        return child.el;
      });
    }
  }
}

export default CollapsableItem;
