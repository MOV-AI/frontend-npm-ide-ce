import * as d3 from "d3";
import lodash from "lodash";
import { Subject } from "rxjs";
import { FLOW_VIEW_MODE } from "../../Constants/constants";

import TemporaryNode from "../Nodes/TemporaryNode";
import TemporaryLink from "../Links/TemporaryLink";
import TemporaryContainerNode from "../Nodes/TemporaryContainerNode";
import TemporaryStateNode from "../Nodes/TemporaryStateNode";

import { canvasLimits } from "../../Constants/constants";

class Canvas {
  constructor(
    mInterface,
    uid,
    type,
    width,
    height,
    maxMovingPixels,
    container,
    readOnly,
    canvasId
  ) {
    this.mInterface = mInterface;
    this.width = width;
    this.height = height;
    this.maxMovingPixels = maxMovingPixels;
    this.type = type;
    this.uid = uid;
    this.container = container;
    this.readOnly = readOnly;

    this.maxMeasures = null;
    this.minScale = null; // The 2 is because we want both sides
    this.pixMin = 0;
    this.pixMax = null;
    this.nodeSize = null;
    this.pixelPerPoint = null;
    this.pointsLocations = [];
    this.zoomBehavior = null;
    this.brushBehavior = null;
    this.currentZoom = null;
    this.bbox = null;
    this.mouse = [0, 0];

    /* canvas elements */
    this.canvasId = canvasId || Math.round(Math.random() * 9999);
    this.svg = null;
    this.canvas = null;
    this.links = null;
    this.brushCanvas = null;

    // subject for canvas events; any element inside the canvas can trigger this subject
    // the subscriber should filter relevant events by name and type
    this.events = new Subject();

    // brush variables
    this._hoveredNode = null;
    this.isBrushing = false;
    this.initialize();
  }

  /** Initialization */

  initialize = () => {
    this.maxMeasures = Math.max(this.width, this.height);
    //this.minScale = this.maxMeasures / this.maxMovingPixels;
    this.minScale = 0.2;
    this.nodeSize =
      0.005 * this.maxMovingPixels < 40 ? 40 : 0.005 * this.maxMovingPixels;
    this.pixelPerPoint = this.nodeSize;
    this.pixMax = this.maxMovingPixels;

    this.zoomBehavior = this._createZoomBehavior();
    this.brushBehavior = this._createBrushBehavior();

    this._init();
  };

  _createZoomBehavior = () => {
    return d3
      .zoom()
      .filter(() => !d3.event.shiftKey)
      .scaleExtent([this.minScale, 4])
      .translateExtent([
        [this.pixMin, this.pixMin],
        [this.pixMax, this.pixMax]
      ])
      .on("zoom", this._cameraUpdate);
  };

  _cameraUpdate = () => {
    const lowScale =
      d3.event.transform.k <= this.minScale
        ? this.minScale
        : d3.event.transform.k * 0.9;
    const maxScale = d3.event.transform.k >= 4 ? 4 : d3.event.transform.k * 1.1;
    this.zoomBehavior.scaleExtent([lowScale, maxScale]);
    this.canvas.attr("transform", d3.event.transform);
    this.links.attr("transform", d3.event.transform);
    this.currentZoom = d3.event.transform;
  };

  _createBrushBehavior = () => {
    return d3
      .brush()
      .extent([
        [this.pixMin, this.pixMin],
        [this.pixMax, this.pixMax]
      ])
      .filter(() => d3.event.shiftKey)
      .keyModifiers(false)
      .on("end", this._endBrush);
  };

  _endBrush = () => {
    if (!d3.event.selection) return;
    this.brushCanvas.call(this.brushBehavior.move, null);
    this._selectNodes(d3.event.selection);
    setTimeout(() => this._delBrushCanvas());
  };

  _selectNodes(quad) {
    const { k, x, y } = this.mInterface.canvas.currentZoom || {
      k: 1,
      x: 0,
      y: 0
    };
    const minCorner = quad[0].map(
      (v, i) => (v + Math.abs(i === 0 ? x : y)) / k
    );
    const maxCorner = quad[1].map(
      (v, i) => (v + Math.abs(i === 0 ? x : y)) / k
    );
    const nodes = Array.from(this.mInterface?.graph?.nodes.values());
    const nodesInsideQuad = [];
    nodes.forEach(node => {
      const { xCenter, yCenter } = node.obj.center;
      const center = [xCenter, yCenter];
      const greaterThanMinCorner = center.every((x, i) => x > minCorner[i]);
      const lessThanMaxCorner = center.every((x, i) => x < maxCorner[i]);
      if (greaterThanMinCorner && lessThanMaxCorner) {
        node.obj.selected = true;
        nodesInsideQuad.push(node.obj);
      }
    });
    const selectedSet = new Set(
      [...this.mInterface.selectedNodes].concat(nodesInsideQuad)
    );
    if (selectedSet.size > 0) {
      this.setMode(
        "selectNode",
        {
          nodes: Array.from(selectedSet),
          shiftKey: true
        },
        true
      );
    }
  }

  _getEditionCursor = mode => {
    const cursor = {
      [FLOW_VIEW_MODE.default]: "default",
      [FLOW_VIEW_MODE.treeView]: "not-allowed"
    };
    return cursor[mode];
  };

  _init = () => {
    this._initSvg()
      ._addDefs()
      ._addCanvas()
      ._addEvents()
      ._addLinksCanvas()
      ._addSubscribers();
  };

  _initSvg = () => {
    const appTheme = this.mInterface.component.props.theme;
    this.svg = d3
      .select(`#${this.container.current.id}`)
      .append("svg")
      .attr("width", "99.8%")
      .attr("height", "99.8%")
      .attr("id", `interface-${this.canvasId}`)
      .attr("focusable", true)
      .attr("tabindex", "-1")
      .style("outline", "none")
      .style("background-color", appTheme.flowEditor.interfaceColor)
      .attr("class", `flow-interface flow-interface-${this.uid}`)
      .call(this.zoomBehavior);
    return this;
  };

  reload = () => {
    const appTheme = this.mInterface.component.props.theme;
    this.svg.style("background-color", appTheme.flowEditor.interfaceColor);
  };

  _addDefs = () => {
    const defs = this.svg.append("svg:defs");
    const { canvasId } = this;
    defs
      .selectAll("marker")
      .data([
        { type: "selected", color: "red" },
        { type: "normal", color: "white" }
      ])
      .enter()
      .append("svg:marker")
      .attr("id", function (d) {
        return `${canvasId}-marker${d.type}`;
      })
      .attr("markerHeight", 5)
      .attr("markerWidth", 5)
      .attr("markerUnits", "strokeWidth")
      .attr("orient", "auto")
      .attr("refX", 0)
      .attr("refY", 0)
      .attr("viewBox", "-5 -5 10 10")
      .append("svg:path")
      .attr("d", "M 0,0 m -5,-5 L 5,0 L -5,5 Z")
      .attr("fill", function (d) {
        return d.color;
      });

    defs
      .append("filter")
      .attr("id", `shadow-${canvasId}`)
      .append("feDropShadow")
      .attr("dx", "1.5")
      .attr("dy", "1.5")
      .attr("stdDeviation", "1");

    return this;
  };

  _addCanvas = () => {
    this.canvas = this.svg
      .append("g")
      .attr("id", `canvasContainer-${this.canvasId}`)
      .attr("class", `canvasContainer-${this.type}-${this.uid}`)
      .attr("width", this.maxMovingPixels)
      .attr("height", this.maxMovingPixels)
      .attr("stroke", "black")
      .style("pointer-events", "all")
      .on("click", d => {});
    return this;
  };

  _addLinksCanvas = () => {
    this.links = this.svg
      .append("g")
      .attr("id", `linksContainer-${this.canvasId}`)
      .attr("class", `linksContainer-${this.type}-${this.uid}`)
      .attr("width", this.maxMovingPixels)
      .attr("height", this.maxMovingPixels)
      .attr("stroke", "black")
      .style("pointer-events", "all")
      .on("click", d => {});

    return this;
  };

  _addBrushCanvas = () => {
    this.isBrushing = true;
    this.brushCanvas = this.svg
      .append("g")
      .attr("class", "brush")
      .call(this.brushBehavior);
    return this;
  };

  _delBrushCanvas = () => {
    this.isBrushing = false;
    d3.selectAll(".brush").remove();
  };

  _addEvents = () => {
    const svg = this.getSvg();

    svg.on("contextmenu", () => {
      this._onContext();
    });

    svg.on("click", () => {
      this._onClick();
    });

    svg.on("mousemove", () => {
      this._onMouseMove();
    });

    svg.on("keydown", () => {
      this._onKeyDown();
    });

    svg.on("keyup", () => {
      this._onKeyUp();
    });

    return this;
  };

  _addSubscribers = () => {
    this.mode.addNode.onEnter.subscribe(node => this.onAddNodeEnter(node));
    this.mode.addNode.onExit.subscribe(() => this.onAddNodeExit());
    this.mode.addFlow.onEnter.subscribe(flow => this.onAddFlowEnter(flow));
    this.mode.addFlow.onExit.subscribe(() => this.onAddFlowExit());
    this.mode.addState.onEnter.subscribe(state => this.onAddStateEnter(state));
    this.mode.addState.onExit.subscribe(() => this.onAddStateExit());
    this.mode.linking.onEnter.subscribe(data => this.onLinkingEnter(data));
    this.mode.linking.onExit.subscribe(() => this.onLinkingExit());
    this.mode.default.onEnter.subscribe(() => this._delBrushCanvas());
    /*this.mode.addNode.onMouseMove.subscribe({
      next: () => this.onAddNodeMouseMove(),
    });*/

    return this;
  };

  destroy = () => {
    // remove any listeners
  };

  /** getters & setters */

  get mode() {
    return this.mInterface.mode;
  }

  get previousMode() {
    return this.mInterface.mode.previousMode;
  }

  get el() {
    return this.svg.node();
  }

  /**
   * get mouse position
   */
  get mouse() {
    return this._mouse;
  }

  /**
   * set mouse position
   * @param {array} value [x,y] position in canvas
   */
  set mouse(value) {
    this._mouse = value;
  }

  set hoveredNode(value) {
    this._hoveredNode = value;
    if (!value && d3.event.shiftKey) {
      this._addBrushCanvas();
    }
  }

  get isMouseOverNode() {
    return this._hoveredNode !== null;
  }

  /**
   * Get selected link
   */
  get selectedLink() {
    return this.mInterface.selectedLink;
  }

  getSvg = () => {
    return this.svg || this._initSvg();
  };

  setMode = (mode, props, force = false) => {
    this.mInterface.setMode(mode, props, force);
  };

  setPreviousMode = () => {
    this.mInterface.setPreviousMode();
  };

  inBoundaries = (x, y) => {
    const fn = (val, min, max) => {
      return val < min || val > max;
    };
    return ![
      [x, ...canvasLimits[0]],
      [y, ...canvasLimits[1]]
    ].some(values => fn(...values));
  };

  append = (element, type = "canvas") => {
    switch (type) {
      case "links":
        this.links.append(element);
        // send links to back
        this.links.lower();
        break;

      default:
        //canvas
        this.canvas.append(element);
        break;
    }
  };

  dispatchEvent = (name, value) => {
    const event = new CustomEvent(name, value);
    this.svg.node().dispatchEvent(event);
  };

  _onContext = () => {
    d3.event.preventDefault();
    d3.event.stopPropagation();

    const transform = d3.zoomTransform(this.svg.node());
    let new_position = [...this.mouse];

    if (transform.k !== 1) {
      new_position = transform.invert(new_position);
    }

    this.setMode(
      "canvasCtxMenu",
      { event: d3.event, position: { x: new_position[0], y: new_position[1] } },
      true
    );
  };

  _onClick = () => {
    // get current mode onClick state if exists
    // if mode does not have onClick then executes the
    // next function in the default object

    // skip event if pressing shift while on selectNode mode
    if (d3.event.shiftKey && this.mode.current.id === "selectNode") return;

    lodash
      .get(this.mode.current, "onClick", {
        next: () => this.setMode("default", null, true)
      })
      .next();
  };

  _onMouseMove = () => {
    this.mouse = d3.mouse(this.svg.node());
    const fn = [
      { id: "addNode", fn: () => this.onAddNodeMouseMove() },
      { id: "addFlow", fn: () => this.onAddNodeMouseMove() },
      { id: "addState", fn: () => this.onAddNodeMouseMove() },
      { id: "linking", fn: () => this.onLinkingMouseMove() }
    ];
    fn.filter(obj => obj.id === this.mode.current.id).forEach(obj => obj.fn());
  };

  _onKeyDown = () => {
    if (d3.event.shiftKey && !this.isMouseOverNode) {
      this._addBrushCanvas();
    }
  };

  _onKeyUp = () => {
    if (d3.event.key === "Shift" && this.isBrushing) {
      this._delBrushCanvas();
    }
  };

  /** Modes */

  onAddNodeEnter = template_id => {
    if (!template_id) return;

    this.svg.node().focus();

    // Not allowed to add nodes in tree view
    const mode = this.mInterface.graph.viewMode;
    const editionCursor = this._getEditionCursor(mode);
    this.svg.style("cursor", editionCursor);

    // Add temp node
    TemporaryNode.builder(this, { Template: template_id }).then(obj => {
      this.mode.addNode.props = obj;
      this.append(() => {
        return this.mode.addNode.props.el;
      });
    });
  };

  onAddNodeExit = () => {
    let node = this.mode.addNode.props;
    this.svg.style("cursor", "default");
    if (node) {
      // remove temporary node from canvas
      node.destroy();
    }
    node = null;
  };

  onAddFlowEnter = template_id => {
    this.svg.node().focus();

    // Not allowed to add nodes in tree view
    const mode = this.mInterface.graph.viewMode;
    const editionCursor = this._getEditionCursor(mode);
    this.svg.style("cursor", editionCursor);

    // Add temp node
    TemporaryContainerNode.builder(this, {
      id: template_id,
      ContainerFlow: template_id,
      ContainerLabel: template_id
    }).then(obj => {
      this.mode.addFlow.props = obj;
      this.append(() => {
        return this.mode.addFlow.props.el;
      });
    });
  };

  onAddFlowExit = () => {
    let node = this.mode.addFlow.props;
    this.svg.style("cursor", "default");
    if (node) {
      // remove temporary node from canvas
      node.destroy();
    }
    node = null;
  };

  onAddStateEnter = state_id => {
    this.svg.node().focus();
    // Not allowed to add nodes in tree view
    const mode = this.mInterface.graph.viewMode;
    const editionCursor = this._getEditionCursor(mode);
    this.svg.style("cursor", editionCursor);
    // Add temp node
    this.mode.addState.props = new TemporaryStateNode(this, {
      Template: state_id
    });
    this.append(() => {
      return this.mode.addState.props.el;
    });
  };

  onAddStateExit = () => {
    let node = this.mode.addState.props;
    this.svg.style("cursor", "default");
    if (node) {
      // remove temporary node from canvas
      node.destroy();
    }
    node = null;
  };

  /**
   * update the node position on mouse move
   */
  onAddNodeMouseMove = () => {
    const transform = d3.zoomTransform(this.svg.node());

    // apply offset to prevent mouse from being positioned on top of the name
    const offset = { x: 0, y: -5 };
    let new_position = [...this.mouse];

    // apply transform on the new_position
    if (transform.k !== 1 || transform.x !== 0 || transform.y !== 0) {
      new_position = transform.invert(new_position);
    }
    // set new position on the temporary node
    this.mode.current.props.setPosition(
      new_position[0] + offset.x,
      new_position[1] + offset.y
    );
  };

  onLinkingEnter = () => {
    const { src } = this.mode.linking.props;

    this.mode.linking.props.link = new TemporaryLink(
      this,
      src.position,
      src.position
    );
    this.append(() => {
      return this.mode.linking.props.link.el;
    }, "links");
  };

  onLinkingExit = () => {
    let { link } = this.mode.linking.props;
    if (link) link.destroy();
    link = null;
  };

  onLinkingMouseMove = () => {
    const transform = d3.zoomTransform(this.svg.node());
    let new_position = [...this.mouse];
    new_position = transform.invert(new_position);
    const trg = {
      x: new_position[0],
      y: new_position[1],
      nodeSize: { height: 50, width: 50 },
      data: {}
    };
    this.mode.linking.props.link.update(null, trg);
  };
}

export default Canvas;
