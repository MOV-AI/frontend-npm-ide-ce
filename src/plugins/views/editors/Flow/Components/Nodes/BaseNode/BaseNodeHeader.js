import * as d3 from "d3";

class BaseNodeHeader {
  constructor(x, y, text) {
    this.object = null;
    this.color = "white";
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 15;
    this.text = text;
    this.unselectable = true;

    this.render();
  }

  destroy = () => {
    this.object.remove();
  };

  /**
   * @private
   * @returns
   */
  render() {
    const parsedText = this.parseText();

    this.object = d3
      .create("svg:text")
      .attr("x", this.x)
      .attr("y", this.y - parsedText.length * this.dy)
      .attr("fill", this.color)
      .attr("stroke-width", 0)
      .attr("class", this.unselectable ? "unselectable" : "")
      .style("font-size", "18px")
      .style("text-anchor", "middle")
      .style("dominant-baseline", "central");

    this.object
      .selectAll("tspan")
      .data(parsedText)
      .enter()
      .append("tspan")
      .style("text-anchor", "middle")
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

  get el() {
    return this.object.node();
  }

  parseText() {
    let text = [];
    try {
      text = this.text.split("_");
    } catch (error) {
      console.error(error);
    }
    return text;
  }
}

export default BaseNodeHeader;
