import * as d3 from "d3";
import lodash from "lodash";
import { generatePathPoints } from "./generatePathPoints";

import { BaseLinkStyles } from "./BaseLinkStyles";
import { isLinkeable } from "../Nodes/BaseNode/PortValidator";

class BaseLinkStruct {
  constructor(
    canvas,
    src,
    trg,
    { id, sourceNode, sourcePort, targetNode, targetPort, dependency, error }
  ) {
    this.canvas = canvas;
    this.src = src; // {x, y, nodeSize {height, width}, type}
    this.trg = trg; // {x, y, nodeSize {height, width}, type}
    this.error = error; // null or { message, fixError() }
    this.maxMovingPixels = canvas.maxMovingPixels;
    this.data = {
      id: id,
      sourceNode: sourceNode,
      sourcePort: sourcePort,
      targetNode: targetNode,
      targetPort: targetPort,
      Dependency: dependency
    };
    this._visible = true;
    this._selected = false;
  }

  get id() {
    return this.data.id;
  }

  get visible() {
    return this._visible;
  }

  set visible(value) {
    this._visible = value;
  }

  get transparent() {
    return this._transparent;
  }

  set transparent(value) {
    this._transparent = value;
    this._transparent === true
      ? setTimeout(() => this._styleTransparent(), 300)
      : this._styleTransparent();
  }

  _calculatePath = (method = undefined) => {
    this.path_points = generatePathPoints(this.src, this.trg, method);
    return this;
  };

  _calculateLine = path_points => {
    return d3
      .line()
      .curve(d3.curveBasis)
      .x(function (d2) {
        return d2.x;
      })
      .y(function (d2) {
        return d2.y;
      })(path_points);
  };
}

export default class BaseLink extends BaseLinkStruct {
  constructor(canvas, src, trg, data, onLinkErrorMouseOver = () => {}) {
    super(canvas, src, trg, data);
    this.object = null;
    this.onLinkErrorMouseOver = onLinkErrorMouseOver;

    this._initialize();
  }

  _initialize = () => {
    this._calculatePath()._renderPath()._addEvents();
  };

  destroy = () => {
    this.object.remove();
  };

  _renderPath = () => {
    const path_points = this.path_points;
    this.object = d3
      .create("svg")
      .attr("id", `path-${this.canvas.containerId}-${this.data.id}`)
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this.maxMovingPixels)
      .attr("height", this.maxMovingPixels);

    this.object
      .append("svg:defs")
      .append("filter")
      .attr("id", `link-shadow-${this.canvas.containerId}-${this.data.id}`)
      .append("feDropShadow")
      .attr("dx", "1")
      .attr("dy", "1")
      .attr("stdDeviation", "1");

    this.object
      .append("path")
      .attr("class", "nodeLink")
      .attr("d", () => {
        return this._calculateLine(path_points);
      })
      //.attr("points", d => d.points)
      /*.attr("stroke-dasharray", d => {
        if (d.tempLink) {
          return "3, 3";
        }
        return null;
      })*/
      .attr("stroke", this.style.stroke.default)
      .attr("stroke-width", this.style.stroke.width)
      //.attr("fill", "transparent")
      .attr("pointer-events", "visibleStroke")
      .attr("fill-opacity", "0");
    // link shadows disabled bc horizontal links are hidden
    /*.attr(
        "filter",
        `url(#${this.canvas.type}-${this.canvas.uid}-link-shadow-${this.data.id}`
      );*/

    return this;
  };

  _addEvents = () => {
    this.path
      .on("mouseover", () => this._eventsOn(this._onMouseOver))
      .on("mouseout", () => this._eventsOn(this._onMouseOut))
      .on("click", () => this._eventsOn(this._onClick))
      .on("contextmenu", () => this._eventsOn(this._onContextMenu));
    return this;
  };

  _refreshPath = () => {
    const path_points = this.path_points;
    this.object.select("path").attr("d", () => {
      return this._calculateLine(path_points);
    });
    return this;
  };

  _eventsOn = (fn, availableInReadOnly = true) => {
    d3.event.preventDefault();
    d3.event.stopPropagation();

    const { visible, readOnly } = this;
    if (visible && (availableInReadOnly || !readOnly)) fn();
  };

  /**
   * Fade out other links (keeping only this link active)
   */
  _fadeOtherLinks = () => {
    this.canvas.events.next({ name: "onMouseOver", type: "Link", data: this });
  };

  /**
   * Remove fade from other links (let all links active)
   */
  _removeLinksFade = () => {
    this.canvas.events.next({ name: "onMouseOut", type: "Link", data: this });
  };

  _styleMouseOver = () => {
    this.path
      .attr("stroke", this.style.stroke.over)
      .attr("marker-mid", `url(#${this.canvas.containerId}-markerselected)`);
  };

  _styleMouseOut = () => {
    this.path
      .attr(
        "stroke",
        this.error ? this.style.stroke.warning : this.style.stroke.default
      )
      .attr("marker-mid", null);
  };

  /**
   * Style to fade link out
   */
  _styleTransparent() {
    const opacity = this.transparent === true ? 0.2 : 1;
    this.path.attr("opacity", opacity);
  }

  _onMouseOver = () => {
    if (this.canvas.mode.current.id === "default") {
      this._styleMouseOver();
    }
    // Fade out other links
    if (!this.canvas.selectedLink) this._fadeOtherLinks();
    // show error tooltip (if any)
    if (this.error) {
      const message = this.error.message;
      const position = { x: d3.event.offsetX, y: d3.event.offsetY };
      this.onLinkErrorMouseOver(
        {
          link: { ...this.data, message, position },
          mouseover: true
        },
        "Link"
      );
    }
  };

  _onMouseOut = () => {
    if (!this._isSelected) {
      this._styleMouseOut();
    }
    // Remove fade out from other links
    if (!this.canvas.selectedLink) this._removeLinksFade();
    // hide tooltip
    if (this.error)
      this.onLinkErrorMouseOver({ link: this.data, mouseover: false }, "Link");
  };

  _onClick = () => {
    if (d3.event.shiftKey) return;

    this.canvas.events.next({ name: "onClick", type: "Link", data: this });
    this.onSelected(!this._isSelected);
  };

  _onContextMenu = () => {
    this.canvas.setMode(
      "linkCtxMenu",
      {
        event: d3.event,
        link_id: this.data.id, //this.data has the link_id
        ...this.data,
        link_type: lodash.get(this.src, "data.message", "Default")
      },
      true
    );
  };

  get el() {
    return this.object.node();
  }

  get path() {
    return this.object.select("path");
  }

  get style() {
    const type = lodash.get(this.src, "data.message", "Default");
    const out = lodash.get(
      BaseLinkStyles,
      type,
      lodash.get(BaseLinkStyles, "Default")
    );
    return out;
  }

  get readOnly() {
    return this.canvas.readOnly;
  }

  set visibility(visible) {
    this.visible = Boolean(visible);
    this.object.attr("visibility", this.visible ? "visible" : "hidden");
  }

  onSelected = selected => {
    this._isSelected = selected;
    if (selected) this._styleMouseOver();
    else {
      this._styleMouseOut();
      this._removeLinksFade();
    }
  };

  update = (src, trg) => {
    this.src = src || this.src;
    this.trg = trg || this.trg;
    this._calculatePath()._refreshPath();
  };

  update_data = data => {
    this.data = { ...this.data, ...data };
  };

  update_error = error => {
    this.error = error;
    this._styleMouseOut();
  };

  /**
   * validate if src and trg are valid instance to create a link
   * @param {object} src - port instance
   * @param {object} trg - port instance
   */
  is_valid = (src, trg, links) => {
    return (
      isLinkeable(src.data, trg.data) && !this.link_exists(src, trg, links)
    );
  };

  ports_any = (src, trg) => {
    return [src, trg].some(port => port.acceptsAny);
  };

  /**
   * Given 2 ports, returns the source and the target
   * @param {obj} port_a port instance
   * @param {obj} port_b port instance
   *
   * @returns {array} [src_port_instance, trg_port_instance]
   */
  get_src_trg = (port_a, port_b) => {
    return ["Out", "In"].map(type => {
      return [port_a, port_b].find(port => port.type === type);
    });
  };

  /**
   * Check if a link between the same ports already exists
   * @param {obj} port_a port instance a
   * @param {obj} port_b port instance b
   * @param {Map} links  {link_id, link_instance}
   *
   * @returns {bool} link exists
   */
  link_exists = (port_a, port_b, links) => {
    // no links to test
    if (!links) return false;
    let output = false;
    const [src, trg] = this.get_src_trg(port_a, port_b);
    const _links = links.values();

    let next_link = _links.next();
    while (!next_link.done) {
      const link = next_link.value.data;
      const from_cond = [
        `${link.sourceNode}/${link.sourcePort}`,
        `${src.node.data.id}/${src.data.name}`
      ];
      const to_cond = [
        `${link.targetNode}/${link.targetPort}`,
        `${trg.node.data.id}/${trg.data.name}`
      ];
      output = [from_cond, to_cond].every(cond => cond[0] === cond[1]);
      if (output) break;

      next_link = _links.next();
    }
    return output;
  };

  /**
   * Given 2 ports, constructs the object to save the link
   * @param {obj} port_a port instance a
   * @param {obj} port_b port instance b
   */
  to_save(port_a, port_b) {
    // find which port is the source and the target
    const [src, trg] = this.get_src_trg(port_a, port_b);
    return {
      source_node: src.node.data.id,
      source_type: src.node._template.template.Type || "",
      source_port: src.data.name,
      target_node: trg.node.data.id,
      target_type: trg.node._template.template.Type || "",
      target_port: trg.data.name
    };
  }

  static parseLink({ name, From, To, Dependency }) {
    const [sourceNode, sourcePort, sourceFullPath] = BaseLink.getNodePort(From);
    const [targetNode, targetPort, targetFullPath] = BaseLink.getNodePort(To);

    return {
      id: name,
      sourceNode,
      sourcePort,
      sourceFullPath,
      targetNode,
      targetPort,
      targetFullPath,
      error: null,
      dependency: Dependency
    };
  }

  /**
   * get the node and port from a part of the link (From or To)
   * @param {string} link From or To
   *
   * @returns {array} [node, port]
   */
  static getNodePort = plink => {
    // source and target nodes can have the following format
    // nodes : <node_name>
    // flows : <container1>__<nodeInContainer> or <Container2>__<Container1>__<nodeNameInContainer1>

    const [_node, ...r_port] = plink.split("/");
    const nodes = _node.split("__");
    const [node, ...l_port] = nodes;

    const subFlow = values => {
      return values.length ? values.join("__").concat("/") : "";
    };

    const fn_port = (x, y) => subFlow(x).concat(y.join("/"));

    // [node, port]
    return [node, fn_port(l_port, r_port), nodes];
  };
}
