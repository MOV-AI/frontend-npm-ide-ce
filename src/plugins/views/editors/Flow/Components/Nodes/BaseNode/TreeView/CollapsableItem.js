import * as d3 from "d3";
import { Expanded, Collapsed } from "./PortIcons";

class CollapsableItem {
  constructor({
    text,
    isExpanded = true,
    parent = null,
    onToggleCollapsePorts = () => {}
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
    this._render();
  }

  /**
   * _render: render collapsable item with header and children container
   */
  _render() {
    // Reset collapsable item
    if (this.object) this.destroy();
    // Create collapsable item
    this.object = d3
      .create("svg")
      .attr("x", "25")
      .attr("y", "65")
      .attr("class", "children-container");
    // Add header
    this._renderHeader();
    // Add children container object
    this._renderChildren();
  }

  /**
   * _renderHeader: render header used to expand/collapse children
   */
  _renderHeader() {
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
      this._renderHeader();
      // Show/Hide children
      if (this.isExpanded) this._renderChildren();
      else this._collapse();
      // Update position
      this._updatePosition();
    });
    // Add header to main object
    this.object.append(() => this._header.node());
  }

  /**
   * _renderChildren: render children container
   */
  _renderChildren() {
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
    this._updateBelongLines(this.children);
  }

  /**
   * _collapse: Collapse children (removing children container)
   */
  _collapse() {
    // Remove belong line
    this.children.forEach(child => {
      if (child.removeBelongLine) child.removeBelongLine();
    });
    // Remove children container
    this._childrenContainer.remove();
  }

  /**
   * _updatePosition: Ask parent (TreeContainerNode) to update its children position
   */
  _updatePosition() {
    if (this.parent) this.parent.updateChildrenPosition();
  }

  /**
   * _updateBelongLines: Update belong lines that connects each nodes with its Container parent
   */
  _updateBelongLines(children) {
    // Update belong lines
    if (!children) return;
    children.forEach(child => {
      if (child.updateBelongLines) child.updateBelongLines();
      this._updateBelongLines(child.children);
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
