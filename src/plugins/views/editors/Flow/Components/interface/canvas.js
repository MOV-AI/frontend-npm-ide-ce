import * as d3 from "d3";
import { Subject } from "rxjs";
import Factory from "../../Components/Nodes/Factory";
import TemporaryLink from "../Links/TemporaryLink";
import { FLOW_VIEW_MODE, canvasLimits } from "../../Constants/constants";
import { DEFAULT_FUNCTION } from "../../../_shared/mocks";

class Canvas {
  constructor({
    classes,
    containerId,
    docManager,
    height,
    maxMovingPixels,
    mInterface,
    width
  }) {
    this.classes = classes;
    this.containerId = containerId;
    this.docManager = docManager;
    this.height = height;
    this.maxMovingPixels = maxMovingPixels;
    this.mInterface = mInterface;
    this.width = width;

    this.initialize();
  }

  //========================================================================================
  /*                                                                                      *
   *                                      Properties                                      *
   *                                                                                      */
  //========================================================================================
  maxMeasures = null;
  minScale = null; // The 2 is because we want both sides
  pixMin = 0;
  pixMax = null;
  nodeSize = null;
  zoomBehavior = null;
  brushBehavior = null;
  currentZoom = null;
  mouse = [0, 0];
  svg = null;
  canvas = null;
  links = null;
  brushCanvas = null;

  // subject for canvas events; any element inside the canvas can trigger this subject
  // the subscriber should filter relevant events by name and type
  events = new Subject();

  // brush variables
  _hoveredNode = null;
  isBrushing = false;

  //========================================================================================
  /*                                                                                      *
   *                                    Initialization                                    *
   *                                                                                      */
  //========================================================================================

  initialize = () => {
    this.maxMeasures = Math.max(this.width, this.height);
    this.minScale = 0.2;
    this.nodeSize =
      0.005 * this.maxMovingPixels < 40 ? 40 : 0.005 * this.maxMovingPixels;
    this.pixMax = this.maxMovingPixels;

    this.zoomBehavior = this.createZoomBehavior();
    this.brushBehavior = this.createBrushBehavior();

    this.init();
  };

  init = () => {
    this.initSvg()
      .addDefs()
      .addCanvas()
      .addEvents()
      .addLinksCanvas()
      .addSubscribers();
  };

  initSvg = () => {
    const { classes } = this;
    this.svg = d3
      .select(`#${this.containerId}`)
      .append("svg")
      .attr("width", "99.8%")
      .attr("height", "99.8%")
      .attr("id", `interface-${this.containerId}`)
      .attr("focusable", true)
      .attr("tabindex", "-1")
      .style("outline", "none")
      //.style("background-color", classes.flowEditor.interfaceColor)
      .attr("class", `flow-interface ${classes.flowEditor.interfaceColor}`)
      .call(this.zoomBehavior);
    return this;
  };

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  createZoomBehavior = () => {
    const { cameraUpdate, minScale, pixMin, pixMax } = this;

    return d3
      .zoom()
      .filter(() => !d3.event.shiftKey)
      .scaleExtent([minScale, 4])
      .translateExtent([
        [pixMin, pixMin],
        [pixMax, pixMax]
      ])
      .on("zoom", cameraUpdate);
  };

  cameraUpdate = () => {
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

  createBrushBehavior = () => {
    const { pixMin, pixMax, endBrush } = this;

    return d3
      .brush()
      .extent([
        [pixMin, pixMin],
        [pixMax, pixMax]
      ])
      .filter(() => d3.event.shiftKey)
      .keyModifiers(false)
      .on("end", endBrush);
  };

  endBrush = () => {
    if (!d3.event.selection) return;

    this.brushCanvas.call(this.brushBehavior.move, null);
    this.selectNodes(d3.event.selection);
    setTimeout(() => this.delBrushCanvas());
  };

  selectNodes(quad) {
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
      const greaterThanMinCorner = center.every(
        (xValue, i) => xValue > minCorner[i]
      );
      const lessThanMaxCorner = center.every(
        (xValue, i) => xValue < maxCorner[i]
      );
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

  getEditionCursor = mode => {
    const cursor = {
      [FLOW_VIEW_MODE.default]: "default",
      [FLOW_VIEW_MODE.treeView]: "not-allowed"
    };
    return cursor[mode];
  };

  reload = () => {
    const { classes } = this;
    this.svg.attr("class", `${classes.flowEditor.interfaceColor}`);
  };

  /**
   * @private
   */
  addDefs = () => {
    const defs = this.svg.append("svg:defs");
    const { containerId } = this;
    defs
      .selectAll("marker")
      .data([
        { type: "selected", color: "red" },
        { type: "normal", color: "white" }
      ])
      .enter()
      .append("svg:marker")
      .attr("id", function (d) {
        return `${containerId}-marker${d.type}`;
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
      .attr("id", `shadow-${containerId}`)
      .append("feDropShadow")
      .attr("dx", "1.5")
      .attr("dy", "1.5")
      .attr("stdDeviation", "1");

    return this;
  };

  /**
   * @private
   */
  addCanvas = () => {
    this.canvas = this.svg
      .append("g")
      .attr("id", `canvasContainer-${this.containerId}`)
      .attr("width", this.maxMovingPixels)
      .attr("height", this.maxMovingPixels)
      .attr("stroke", "black")
      .style("pointer-events", "all")
      .on("click", d => DEFAULT_FUNCTION());
    return this;
  };

  /**
   * @private
   */
  addLinksCanvas = () => {
    this.links = this.svg
      .append("g")
      .attr("id", `linksContainer-${this.containerId}`)
      .attr("width", this.maxMovingPixels)
      .attr("height", this.maxMovingPixels)
      .attr("stroke", "black")
      .style("pointer-events", "all")
      .on("click", d => DEFAULT_FUNCTION());

    return this;
  };

  /**
   * @private
   */
  addBrushCanvas = () => {
    this.isBrushing = true;
    this.brushCanvas = this.svg
      .append("g")
      .attr("class", "brush")
      .call(this.brushBehavior);
    return this;
  };

  /**
   * @private
   */
  delBrushCanvas = () => {
    this.isBrushing = false;
    d3.selectAll(".brush").remove();
  };

  /**
   * @private
   */
  addEvents = () => {
    const svg = this.getSvg();
    const events = [
      {
        event: "contextmenu",
        fn: () => this.onContext()
      },
      {
        event: "click",
        fn: () => this.onClick()
      },
      {
        event: "mousemove",
        fn: () => this.onMouseMove()
      },
      {
        event: "keydown",
        fn: () => this.onKeyDown()
      },
      {
        event: "keyup",
        fn: () => this.onKeyUp()
      }
    ];

    events.forEach(item => {
      svg.on(item.event, item.fn);
    });

    return this;
  };

  /**
   * @private
   */
  addSubscribers = () => {
    this.mode.addNode.onEnter.subscribe(node => this.onAddNodeEnter(node));
    this.mode.addNode.onExit.subscribe(() => this.onAddNodeExit());
    this.mode.addFlow.onEnter.subscribe(flow => this.onAddFlowEnter(flow));
    this.mode.addFlow.onExit.subscribe(() => this.onAddFlowExit());
    this.mode.addState.onEnter.subscribe(state => this.onAddStateEnter(state));
    this.mode.addState.onExit.subscribe(() => this.onAddStateExit());
    this.mode.linking.onEnter.subscribe(data => this.onLinkingEnter(data));
    this.mode.linking.onExit.subscribe(() => this.onLinkingExit());
    this.mode.default.onEnter.subscribe(() => this.delBrushCanvas());

    return this;
  };

  //========================================================================================
  /*                                                                                      *
   *                                   Getters & Setters                                  *
   *                                                                                      */
  //========================================================================================

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
   * Return mouse position in object with x and y
   */
  get mousePosition() {
    return { x: this._mouse[0], y: this._mouse[1] };
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
      this.addBrushCanvas();
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
    return this.svg || this.initSvg();
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
    if (type === "links") {
      this.links.append(element);
      // send links to back
      this.links.lower();
    } else {
      this.canvas.append(element);
    }
  };

  dispatchEvent = (name, value) => {
    const event = new CustomEvent(name, value);
    this.svg.node().dispatchEvent(event);
  };

  /**
   * @private
   */
  onContext = () => {
    d3.event.preventDefault();
    d3.event.stopPropagation();

    const transform = d3.zoomTransform(this.svg.node());
    let newPosition = [...this.mouse];

    if (transform.k !== 1) {
      newPosition = transform.invert(newPosition);
    }

    this.setMode(
      "canvasCtxMenu",
      { event: d3.event, position: { x: newPosition[0], y: newPosition[1] } },
      true
    );
  };

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * @private
   */
  onClick = () => {
    // get current mode onClick state if exists
    // if mode does not have onClick then executes the
    // next function in the default object

    // skip event if pressing shift while on selectNode mode
    if (d3.event.shiftKey && this.mode.current.id === "selectNode") return;

    const fn = this.mode.current.onClick ?? {
      next: () => {
        this.setMode("default", null, true);
      }
    };
    fn.next();
  };

  /**
   * @private
   */
  onMouseMove = () => {
    this.mouse = d3.mouse(this.svg.node());
    const fn = [
      { id: "addNode", fn: () => this.onAddNodeMouseMove() },
      { id: "addFlow", fn: () => this.onAddNodeMouseMove() },
      { id: "addState", fn: () => this.onAddNodeMouseMove() },
      { id: "linking", fn: () => this.onLinkingMouseMove() }
    ];
    fn.filter(obj => obj.id === this.mode.current.id).forEach(obj => obj.fn());
  };

  /**
   * @private
   */
  onKeyDown = () => {
    if (d3.event.shiftKey && !this.isMouseOverNode) {
      this.addBrushCanvas();
    }
  };

  /**
   * @private
   */
  onKeyUp = () => {
    if (d3.event.key === "Shift" && this.isBrushing) {
      this.delBrushCanvas();
    }
  };

  onAddNodeEnter = props => {
    const { templateId } = props;
    const modeEvent = this.mode.addNode;
    const node = { Template: templateId };
    const factoryOutput = Factory.OUTPUT.TMP_NODE;

    this.addNodeEnter({ modeEvent, node, factoryOutput });
  };

  onAddNodeExit = () => {
    const { node } = this.mode.addNode.props;
    this.svg.style("cursor", "default");
    if (node) {
      // remove temporary node from canvas
      node.destroy();
    }
  };

  onAddFlowEnter = props => {
    const { templateId } = props;
    const modeEvent = this.mode.addFlow;
    const node = {
      id: templateId,
      ContainerFlow: templateId,
      ContainerLabel: templateId
    };
    const factoryOutput = Factory.OUTPUT.TMP_CONTAINER;

    this.addNodeEnter({ modeEvent, node, factoryOutput });
  };

  addNodeEnter = props => {
    const { modeEvent, node, factoryOutput } = props;
    this.svg.node().focus();

    const mode = this.mInterface.graph.viewMode;
    const editionCursor = this.getEditionCursor(mode);
    this.svg.style("cursor", editionCursor);

    // Add temp node
    Factory.create(this.docManager, factoryOutput, {
      canvas: this,
      node,
      events: {}
    }).then(obj => {
      modeEvent.props.node = obj;

      this.append(() => {
        return obj.el;
      });
    });
  };

  onAddFlowExit = () => {
    const { node } = this.mode.addFlow.props;
    this.svg.style("cursor", "default");
    if (node) {
      // remove temporary node from canvas
      node.destroy();
    }
  };

  /**
   * update the node position on mouse move
   */
  onAddNodeMouseMove = () => {
    const transform = d3.zoomTransform(this.svg.node());

    // apply offset to prevent mouse from being positioned on top of the name
    const offset = { x: 0, y: -5 };
    let newPosition = [...this.mouse];

    // apply transform on the newPosition
    if (transform.k !== 1 || transform.x !== 0 || transform.y !== 0) {
      newPosition = transform.invert(newPosition);
    }
    // set new position on the temporary node
    this.mode.current.props?.node?.setPosition(
      newPosition[0] + offset.x,
      newPosition[1] + offset.y
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
    const { link } = this.mode.linking.props;
    if (link) link.destroy();
  };

  onLinkingMouseMove = () => {
    const transform = d3.zoomTransform(this.svg.node());
    let newPosition = [...this.mouse];
    newPosition = transform.invert(newPosition);
    const trg = {
      x: newPosition[0],
      y: newPosition[1],
      nodeSize: { height: 50, width: 50 },
      data: {}
    };
    this.mode.linking.props.link.update(null, trg);
  };
}

export default Canvas;
