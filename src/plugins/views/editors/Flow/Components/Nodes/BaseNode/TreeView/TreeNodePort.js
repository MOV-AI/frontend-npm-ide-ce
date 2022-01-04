import * as d3 from "d3";
import BasePort from "../BasePort";
import TreeNodePortLink from "./TreeNodePortLink";
import { InputPort, OutputPort } from "./PortIcons";

class TreeNodePort extends BasePort {
  constructor(node, data, events) {
    super(node, data, events);
    // Add links container object
    this._linksObject = d3
      .create("svg")
      .attr("class", "links-container")
      .attr("x", "25")
      .attr("y", "18");
    this.object.append(() => {
      return this._linksObject.node();
    });
  }

  /**
   * @override _render - render node port information
   *  - Includes input/output icon, name and links information
   */
  _render() {
    this.object = d3
      .create("svg")
      .attr("width", "800")
      .attr("class", "children-container")
      .attr("fill", this.color);

    // Add port icon
    this.object.append(() => {
      const portIconBuilder = this.data.type === "In" ? InputPort : OutputPort;
      return portIconBuilder.getIcon();
    });

    // Add port name
    this.object
      .append("text")
      .attr("class", "text unselectable")
      .attr("stroke-width", 0)
      .attr("x", 32)
      .attr("y", 7)
      .style("font-size", "15px")
      .style("dominant-baseline", "central")
      .text(this.data.name);

    return this;
  }

  /**
   * @override _addEvents - Add port events
   *  - Limit events to mouseenter/mouseout
   */
  _addEvents() {
    this.object.on("mouseenter", this._onMouseOver);
    this.object.on("mouseout", this._onMouseOut);
    return this;
  }

  /**
   * @override setPosition - Set port position
   *  - Update only y position (x position should never change)
   *
   * @param {number} y: Y position
   */
  setPosition(y = this.cy) {
    this.object.attr("y", y);
    return this;
  }

  /**
   * addLink - Add link information to port
   *
   * @param {Object} link: Parsed link information
   */
  addLink(link) {
    const linkObj = new TreeNodePortLink(link, this.data.type, this.node);
    this.links.set(link.id, linkObj);
    this._linksObject.append(() => {
      return linkObj.el;
    });
    return this;
  }

  /**
   * Remove link from port
   *
   * @param {Object} link : Link info
   */
  removeLink(link) {
    this.links.delete(link.id);
    this._linksObject.selectAll("*").remove();
  }

  /**
   * updateLinksPosition - Update links y position
   */
  updateLinksPosition() {
    let linksHeightSum = 0;
    this.links.forEach(link => {
      link.object.attr("y", linksHeightSum);
      linksHeightSum += link.el.getBBox().height + 5;
    });
    return this;
  }
}

export default TreeNodePort;
