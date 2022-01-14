import * as d3 from "d3";
import BaseNodeHeader from "../BaseNodeHeader";

const TEMPLATE_LABEL = {
  container: "Flow",
  node: "Node"
};

class TreeNodeHeader extends BaseNodeHeader {
  constructor(x, y, text, template, type = "node") {
    super(x, y, text);
    this.dy = 18;
    this.template = `${TEMPLATE_LABEL[type]}: ${template}`;
    // Update rendered header
    this.render();
  }

  /**
   * @private
   * @override render - render node header
   *  Place node name and template name besides the node rect
   */
  render() {
    const parsed_text = this.parse_text();

    this.object = d3
      .create("svg:text")
      .attr("x", this.x)
      .attr("y", this.y)
      .attr("stroke-width", 0)
      .attr("fill", this.color)
      .attr("class", this.unselectable ? "unselectable" : "")
      .style("font-size", "16px")
      .style("dominant-baseline", "central");

    this.object
      .selectAll("tspan")
      .data(parsed_text)
      .enter()
      .append("tspan")
      .style("dominant-baseline", "central")
      .attr("class", "text")
      .attr("dx", this.dx)
      .attr("dy", this.dy)
      .attr("x", this.x)
      .text(function (d) {
        return d;
      });

    return this;
  }

  /**
   * @override parse_text - Parse text
   *  Add two lines: Node name and Node template
   */
  parse_text() {
    // let text = [this.text, this.template];
    let text = [this.text];
    return text;
  }
}

export default TreeNodeHeader;
