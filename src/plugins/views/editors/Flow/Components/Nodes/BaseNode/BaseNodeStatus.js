import * as d3 from "d3";

class BaseNodeStatus {
  constructor(cx, cy, color, radius = 12) {
    this.object = null;
    this.cx = cx || 45;
    this.cy = cy || 12;
    this.radius = radius;
    this._status = false;
    this._loading = false;
    this._loadingTimeout = null;
    this.color = color || "grey";
    this.opacity = 0.3;

    this.render();
  }

  destroy = () => {
    this.object.remove();
  };

  /**
   * @private
   * @returns
   */
  render = () => {
    this.object = d3
      .create("svg:circle")
      .attr("id", "status")
      .attr("cx", this.cx)
      .attr("cy", this.cy)
      .attr("r", this.radius)
      .attr("class", "node-inst-click-area")
      .attr("stroke", this.color)
      .attr("fill", this.color)
      .style("opacity", this.opacity);

    return this;
  };

  /**
   * @private
   * @returns
   */
  statusAnimation = () => {
    // add yellow loading status and stop animation
    if (this._loading) {
      this.object
        .style("fill", "yellow")
        .attr("stroke", "yellow")
        .style("opacity", 0.7);
      return this;
    }
    // stop animation
    if (!this._status) {
      this.object
        .style("fill", this.color)
        .attr("stroke", this.color)
        .style("opacity", this.opacity);
      return this;
    }

    //start animation
    const animate = () => {
      // do not continue to animate
      if (this._status === false || this._loading) {
        return this.statusAnimation();
      }

      this.object
        .transition()
        .ease(d3.easeLinear)
        .duration(800)
        .style("fill", "#9dfab0")
        .style("opacity", 1)
        .attr("stroke", "#9dfab0")
        .transition()
        .ease(d3.easeQuad)
        .duration(800)
        .style("fill", "#036b18")
        .style("opacity", 1)
        .attr("stroke", "#036b18")
        .on("end", animate);
    };

    requestAnimationFrame(animate);

    return this;
  };

  get el() {
    return this.object.node();
  }

  get isReady() {
    return !this._loading;
  }

  get status() {
    return this._status;
  }

  set status(value) {
    this._loading = false;
    this._status = value;
    this.statusAnimation();
    clearTimeout(this._loadingTimeout);
  }

  set statusLoading(val) {
    this._loading = val;
    this.statusAnimation();
    // set timeout to stop loading
    clearTimeout(this._loadingTimeout);
    this._loadingTimeout = setTimeout(() => {
      if (this._loading) {
        this._loading = false;
        this.statusAnimation();
      }
    }, 5000);
  }
}

export default BaseNodeStatus;
