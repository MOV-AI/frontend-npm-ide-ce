import * as d3 from "d3";
import i18n from "../../../../../../../i18n/i18n";
import BaseNodeHeader from "../BaseNodeHeader";

class TreeNodeHeader extends BaseNodeHeader {
  constructor(x, y, text, template, type, endless = false) {
    super(x, y, text);
    this.dy = 18;
    this.type = type;
    this.templateString = `${i18n.t("RecursiveTemplate-Colon")} ${template}`;
    this.isEndless = endless;
    // Update rendered header
    this.render();
  }

  /**
   * @private
   * @override render - render node header
   *  Place node name and template name besides the node rect
   */
  render() {
    const parsedText = this.parseText();

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
      .data(parsedText)
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

    if (this.isEndless) {
      this.object
        .append("tspan")
        .attr("x", this.x)
        .attr("dy", "1.2em")
        .attr("fill", "red")
        .text(this.templateString);
    }

    return this;
  }

  /**
   * @override parseText - Parse text
   *  Add two lines: Node name and Node template
   */
  parseText() {
    const ret = [this.text];

    if (this.type) ret.push(this.type);
    return ret;
  }
}

export default TreeNodeHeader;
