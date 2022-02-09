import * as d3 from "d3";
import { baseLinkStyles } from "./styles";
import { generatePathPoints } from "./generatePathPoints";
import { isLinkeable } from "../Nodes/BaseNode/PortValidator";
import { DEFAULT_FUNCTION } from "../../../_shared/mocks";

const SUBFLOW_TYPE = "MovAI/Flow";
const SEPARATOR = {
  SUBFLOW: "__",
  NODE: "/"
};

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
      ? setTimeout(() => this.styleTransparent(), 300)
      : this.styleTransparent();
  }

  /**
   * @private
   */
  calculatePath = method => {
    this.pathPoints = generatePathPoints(this.src, this.trg, method);
    return this;
  };

  /**
   * @private
   * @param {*} pathPoints
   * @returns
   */
  calculateLine = pathPoints => {
    return d3
      .line()
      .curve(d3.curveBasis)
      .x(function (d2) {
        return d2.x;
      })
      .y(function (d2) {
        return d2.y;
      })(pathPoints);
  };
}

export default class BaseLink extends BaseLinkStruct {
  constructor(canvas, src, trg, data, onLinkErrorMouseOver) {
    super(canvas, src, trg, data);
    this.object = null;
    this.onLinkErrorMouseOver =
      onLinkErrorMouseOver || (() => DEFAULT_FUNCTION("onLinkErrorMouseOver"));

    this.initialize();
  }

  /**
   * @private
   */
  initialize = () => {
    this.calculatePath().renderPath().addEvents();
  };

  destroy = () => {
    this.object.remove();
  };

  /**
   * @private
   * @returns {BaseLink}
   */
  renderPath = () => {
    const { pathPoints } = this;
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
        return this.calculateLine(pathPoints);
      })
      .attr("stroke", this.style.stroke.default)
      .attr("stroke-width", this.style.stroke.width)
      .attr("pointer-events", "visibleStroke")
      .attr("fill-opacity", "0");

    return this;
  };

  /**
   * @private
   * @returns {BaseLink}
   */
  addEvents = () => {
    this.path
      .on("mouseover", () => this.eventsOn(this.onMouseOver))
      .on("mouseout", () => this.eventsOn(this.onMouseOut))
      .on("click", () => this.eventsOn(this.onClick))
      .on("contextmenu", () => this.eventsOn(this.onContextMenu));
    return this;
  };

  /**
   * @private
   * @returns {BaseLink}
   */
  refreshPath = () => {
    const { pathPoints } = this;
    this.object.select("path").attr("d", () => {
      return this.calculateLine(pathPoints);
    });
    return this;
  };

  /**
   * @private
   * @param {*} fn
   * @param {*} availableInReadOnly
   */
  eventsOn = (fn, availableInReadOnly = true) => {
    d3.event.preventDefault();
    d3.event.stopPropagation();

    const { visible, readOnly } = this;
    if (visible && (availableInReadOnly || !readOnly)) fn();
  };

  /**
   * @private
   * Fade out other links (keeping only this link active)
   */
  fadeOtherLinks = () => {
    this.canvas.events.next({ name: "onMouseOver", type: "Link", data: this });
  };

  /**
   * @private
   * Remove fade from other links (let all links active)
   */
  removeLinksFade = () => {
    this.canvas.events.next({ name: "onMouseOut", type: "Link", data: this });
  };

  /**
   * @private
   */
  styleMouseOver = () => {
    this.path
      .attr("stroke", this.style.stroke.over)
      .attr("marker-mid", `url(#${this.canvas.containerId}-markerselected)`);
  };

  /**
   * @private
   */
  styleMouseOut = () => {
    this.path
      .attr(
        "stroke",
        this.error ? this.style.stroke.warning : this.style.stroke.default
      )
      .attr("marker-mid", null);
  };

  /**
   * @private
   * Style to fade link out
   */
  styleTransparent() {
    const opacity = this.transparent ? 0.2 : 1;
    this.path.attr("opacity", opacity);
  }

  /**
   * @private
   */
  onMouseOver = () => {
    if (this.canvas.mode.current.id === "default") {
      this.styleMouseOver();
    }
    // Fade out other links
    if (!this.canvas.selectedLink) this.fadeOtherLinks();
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

  /**
   * @private
   */
  onMouseOut = () => {
    if (!this._isSelected) {
      this.styleMouseOut();
    }
    // Remove fade out from other links
    if (!this.canvas.selectedLink) this.removeLinksFade();
    // hide tooltip
    if (this.error)
      this.onLinkErrorMouseOver({ link: this.data, mouseover: false }, "Link");
  };

  /**
   * @private
   * @returns
   */
  onClick = () => {
    if (d3.event.shiftKey) return;

    this.canvas.events.next({ name: "onClick", type: "Link", data: this });
    this.onSelected(!this._isSelected);
  };

  /**
   * @private
   */
  onContextMenu = () => {
    this.canvas.setMode(
      "linkCtxMenu",
      {
        event: d3.event,
        linkId: this.data.id, //this.data has the linkId
        ...this.data,
        linkType: this.src.data?.message ?? "_default"
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
    const type = this.src.data?.message;
    return baseLinkStyles[type] ?? baseLinkStyles._default;
  }

  get readOnly() {
    return this.canvas.readOnly;
  }

  /**
   * Set link visibility
   * @param {boolean} visible
   */
  set visibility(visible) {
    this.visible = Boolean(visible);
    this.object.attr("visibility", this.visible ? "visible" : "hidden");
  }

  onSelected = selected => {
    this._isSelected = selected;
    if (selected) this.styleMouseOver();
    else {
      this.styleMouseOut();
      this.removeLinksFade();
    }
  };

  update = (src, trg) => {
    this.src = src || this.src;
    this.trg = trg || this.trg;
    this.calculatePath().refreshPath();
  };

  updateData = data => {
    this.data = { ...this.data, ...data };
  };

  updateError = error => {
    this.error = error;
    this.styleMouseOut();
  };

  /**
   * validate if src and trg are valid instance to create a link
   * @param {object} src - port instance
   * @param {object} trg - port instance
   */
  isValid = (src, trg, links) => {
    return isLinkeable(src.data, trg.data) && !this.linkExists(src, trg, links);
  };

  portsAny = (src, trg) => {
    return [src, trg].some(port => port.acceptsAny);
  };

  /**
   * Given 2 ports, returns the source and the target
   * @param {obj} portA port instance
   * @param {obj} portB port instance
   *
   * @returns {array} [<src port instance>, <trg port instance>]
   */
  getSrcTrg = (portA, portB) => {
    return ["Out", "In"].map(type => {
      return [portA, portB].find(port => port.type === type);
    });
  };

  /**
   * Check if a link between the same ports already exists
   * @param {obj} portA port instance a
   * @param {obj} portB port instance b
   * @param {Map} links  {linkId, <link instance>}
   *
   * @returns {bool} link exists
   */
  linkExists = (portA, portB, links) => {
    if (!links) return false;
    const [src, trg] = this.getSrcTrg(portA, portB);
    const _links = links.values();

    let nextLink = _links.next();
    while (!nextLink.done) {
      const link = nextLink.value.data;

      const fromCond = [
        `${link.sourceNode}/${link.sourcePort}`,
        `${src.node.data.id}/${src.data.name}`
      ];
      const toCond = [
        `${link.targetNode}/${link.targetPort}`,
        `${trg.node.data.id}/${trg.data.name}`
      ];

      if ([fromCond, toCond].every(cond => cond[0] === cond[1])) {
        return true;
      }

      nextLink = _links.next();
    }

    return false;
  };

  /**
   * Given 2 ports, constructs the object to save the link
   * @param {obj} portA port instance a
   * @param {obj} portB port instance b
   */
  toSave(portA, portB) {
    // find which port is the source and the target
    const values = this.getSrcTrg(portA, portB);

    return values.map(item => {
      const node = item.node.data.id;
      const type = item.node._template?.Type ?? "";
      const port = item.data.name;
      const separator =
        type === SUBFLOW_TYPE ? SEPARATOR.SUBFLOW : SEPARATOR.NODE;

      return [node, port].join(separator);
    });
  }

  static parseLink({ id, From, To, Dependency }) {
    const [sourceNode, sourcePort, sourceFullPath] = BaseLink.getNodePort(From);
    const [targetNode, targetPort, targetFullPath] = BaseLink.getNodePort(To);

    return {
      id,
      sourceNode,
      sourcePort,
      sourceFullPath,
      targetNode,
      targetPort,
      targetFullPath,
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
    // nodes : <node name>
    // flows : <container1>__<nodeInContainer> or <Container2>__<Container1>__<nodeNameInContainer1>

    const [_node, ...rPort] = plink.split(SEPARATOR.NODE);
    const nodes = _node.split(SEPARATOR.SUBFLOW);
    const [node, ...lPort] = nodes;

    const subFlow = values => {
      return values.length
        ? values.join(SEPARATOR.SUBFLOW).concat(SEPARATOR.NODE)
        : "";
    };

    const fnPort = (x, y) => subFlow(x).concat(y.join(SEPARATOR.NODE));

    // [node, port]
    return [node, fnPort(lPort, rPort), nodes];
  };
}
