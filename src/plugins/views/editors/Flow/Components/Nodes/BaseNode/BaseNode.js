import * as d3 from "d3";
import _omit from "lodash/omit";
import { convertVisualization, convertTypeCss } from "../Utils";

import { flattenObject } from "../../../Utils/utils";

import BaseNodeStruct from "./BaseNodeStruct";
import BasePort from "./BasePort";
import BaseNodeHeader from "./BaseNodeHeader";
import BaseNodeStatus from "./BaseNodeStatus";
import { EVT_NAMES } from "../../../events";
import { TYPES } from "../../../Constants/constants";

const STYLE = {
  stroke: {
    width: { default: 0, selected: 3 },
    color: { default: "black", selected: "white" }
  }
};

const MINI = {
  width: 18,
  height: 18,
  padding: 5
};

/**
 * class representing a node
 * BaseNode should not be used directly
 * Extend it and call init in the constructor
 */
class BaseNode extends BaseNodeStruct {
  /**
   *
   * @param {object} canvas the canvas where the node will be added
   * @param {object} node node's data
   * @param {object} events functions to be called on node's events
   * @param {object} template the template data
   */
  constructor({ canvas, node, events, template }) {
    super(node);
    this.canvas = canvas;
    this.events = events;
    this._template = template;

    //========================================================================================
    /*                                                                                      *
     *                                      Properties                                      *
     *                                                                                      */
    //========================================================================================

    this.dbClickTimeout = null;
    this.object = null;
    this._drag = { handler: null, debounce: null, delta: { x: 0, y: 0 } };
    this._header = null;
    this._selected = false;
    this._status = false; // true -> running: flase -> stopped
  }

  //========================================================================================
  /*                                                                                      *
   *                                   Getters & Setters                                  *
   *                                                                                      */
  //========================================================================================

  /**
   * el - returns svg element
   *
   * @returns {object} svg element
   */
  get el() {
    return this.object.node();
  }

  /**
   * Returns the name of the node
   *
   * @returns {string} name of the node
   */
  get name() {
    return this.data.NodeLabel;
  }

  /**
   * Returns the port size
   *
   * @returns {number} port size
   */
  get portSize() {
    return this.minSize.w * 0.07;
  }

  /**
   * status - returns the status of the node
   *
   * @returns {boolean} true if running, false otherwise
   */
  get status() {
    return this._status.status;
  }

  get readOnly() {
    return this.canvas.readOnly;
  }

  /**
   * template - returns node template data
   *
   * @returns {object} node template data
   */
  get template() {
    return this._template;
  }

  /**
   * status - set the status of the node
   *
   * @param {boolean} value true if running, false otherwise
   */
  set status(value) {
    this._status.status = value;
  }

  /**
   * selected - returns if the node is selected
   *
   * @returns {boolean} true if the node is selected, false otherwise
   */
  get selected() {
    return this._selected;
  }

  /**
   * selected - set node to selected
   *
   * @param {boolean} value true if the node is selected, false otherwise
   */
  set selected(value) {
    this._selected = Boolean(value);
    this.onSelected();
  }

  /**
   * headerPos - get the position of the header
   *
   * @returns {object} object with the header position {x: val, y: val}
   */
  get headerPos() {
    return {
      x: this.width / 2 + this.padding.x / 2,
      y: -10
    };
  }

  /**
   * Returns the node's template name
   *
   * @returns {string} the template name
   */
  get templateName() {
    return this.data.Template;
  }

  /**
   * visibility - set the node's visibility
   *
   * @param {boolean} visible true if the node is visible, false otherwise
   */
  set visibility(visible) {
    this.visible = Boolean(visible);
    this.object.attr("visibility", this.visible ? "visible" : "hidden");
    this._ports.forEach(port => (port.visible = this.visible));
  }

  /**
   * Return visualization to DB format
   */
  get visualizationToDB() {
    return {
      x: { Value: this.data.Visualization[0] },
      y: { Value: this.data.Visualization[1] }
    };
  }

  /**
   * Get the node ports
   * @return {Map} : This node's ports
   */
  get ports() {
    return this._ports;
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * initialize the node element
   */
  init() {
    this.addPorts()
      .renderBody()
      .renderHeader()
      .renderStatus()
      .renderPorts()
      .addEvents();

    return this;
  }

  /**
   * @private
   * renderBody - render the body of the node
   */
  renderBody() {
    const { stroke } = STYLE;
    const { padding } = this;
    const maxPadding = Math.max(padding.x, padding.y);

    // object already exists; probably an update request
    if (this.object) this.object.remove();

    // create the svg element
    this.object = d3
      .create("svg")
      .attr(
        "id",
        `${this.canvas.containerId}-${this.data.id || this.data.Template}`
      )
      .style("overflow", "visible")
      .attr("width", this.width + maxPadding)
      .attr("height", this.height + maxPadding)
      .attr("x", this.posX)
      .attr("y", this.posY);

    // add a rect to the svg element
    // this is the body of the node
    this.object
      .append("svg:rect")
      .attr("x", padding.x / 2)
      .attr("y", padding.y)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("class", convertTypeCss(this._template))
      .attr("filter", `url(#shadow-${this.canvas.containerId})`)
      .attr("stroke", stroke.color.default)
      .attr("stroke-width", stroke.width.default);

    return this;
  }

  /**
   * @private
   * updateSize - update the size of the node (used after a template update)
   */
  updateSize = () => {
    const maxPadding = Math.max(this.padding.x, this.padding.y);
    this.object
      .attr("width", this.width + maxPadding)
      .attr("height", this.height + maxPadding);
    this.object
      .select("rect")
      .attr("width", this.width)
      .attr("height", this.height);
    return this;
  };

  /**
   * @private
   * addEvents - add events to the svg element
   */
  addEvents = () => {
    // node event listeners
    this.object.on("click", () => this.eventsOn(this.onClick));
    this.object.on("mousedown", () => this.eventsOn(this.onMouseDown));
    this.object.on("mouseenter", () => this.eventsOn(this.onMouseEnter));
    this.object.on("mouseleave", () => this.eventsOn(this.onMouseLeave));
    this.object.on("dblclick", () => this.eventsOn(this.onDblClick));

    this.object.on("contextmenu", () => this.eventsOn(this.onContext));

    this.addDrag();

    return this;
  };

  /**
   * @private
   * @returns
   */
  addDrag = () => {
    if (this.readOnly) return this;
    // assign drag handler to node object
    this._drag.handler = d3
      .drag()
      .on("start", () => this.eventsOn(this.onDragStart))
      .on("end", () => this.eventsOn(this.onDragEnd))
      .on("drag", () => this.eventsOn(this.onDrag));
    this._drag.handler(this.object);
    return this;
  };

  /**
   * @private
   * renderHeader - render the node header
   */
  renderHeader() {
    // header already exists; probably an update request;
    if (this._header) this._header.destroy();

    // create the node header instance
    this._header = new BaseNodeHeader(
      this.headerPos.x,
      this.headerPos.y,
      this.name
    );

    // append to the svg element
    this.object.append(() => {
      return this._header.el;
    });

    return this;
  }

  /**
   * @private
   * renderStatus - render the status of the node (circle on the body)
   */
  renderStatus = () => {
    // status already exists; probably an update request;
    if (this._status) this._status.destroy();

    // create the node status instance
    this._status = new BaseNodeStatus(
      this.width / 2 + this.padding.x / 2,
      this.height / 2 + this.padding.y
    );

    // append to the svg element
    this.object.append(() => {
      return this._status.el;
    });

    return this;
  };

  /**
   * @private
   * @returns
   */
  portEvents() {
    return {
      onClick: port => this.onPortClick(port),
      onMouseOver: port => this.onPortMouseOver(port),
      onMouseOut: port => {
        try {
          const elementMouseIsOver = document.elementFromPoint(
            d3.event.clientX,
            d3.event.clientY
          );

          if (
            elementMouseIsOver.classList.contains("portTooltip") ||
            elementMouseIsOver.classList.contains("MuiTypography-caption")
          )
            return;
        } catch (error) {
          console.debug(error);
        }
        this.onPortMouseOut(port);
      },
      onContext: port => this.onPortContext(port)
    };
  }

  /**
   * @private
   * addPorts - add node ports
   */
  addPorts(portBuilder) {
    const builder =
      portBuilder ??
      ((pNode, pData, pEvents) => new BasePort(pNode, pData, pEvents));

    // port events
    const portEvents = this.portEvents();

    // node already has ports; probably an update request
    if (this._ports.size > 0) {
      this._ports.forEach(port => {
        port.destroy();
      });
      this._ports.clear();
    }

    // add ports
    try {
      // get ports from the node's template
      const ports = this._template?.PortsInst ?? {};

      Object.keys(ports).forEach(portInstName => {
        // check In and Out ports
        ["In", "Out"].forEach(type => {
          // get port data
          const data = ports[portInstName]?.[type] ?? {};

          Object.keys(data).forEach(portName => {
            // customize port data for the instance
            const portData = {
              name: `${portInstName}/${portName}`,
              type: type,
              Template: ports[portInstName]?.Template ?? "",
              ...data[portName]
            };

            // create port instance
            const port = builder(this, portData, portEvents);

            // check if the create port is valid
            if (port.isValid()) {
              // add port instance
              const fmtPortName = `${portInstName}/${portName}`;
              this._ports.set(fmtPortName, port);
            }
          });
        });
      });
    } catch (error) {
      console.error(error);
    }

    return this;
  }

  /**
   * @private
   * renderPorts - render ports. should be called after adding the ports
   */
  renderPorts() {
    const radius = this.portSize;
    const position = {
      In: this.getPortsInitialPos("In"),
      Out: this.getPortsInitialPos("Out")
    };

    this._ports.forEach(port => {
      // append port to the svg element
      this.object.append(() => {
        port.setPosition(...position[port.type], radius);
        return port.el;
      });

      // increment ports position
      position[port.type][1] += this.portsSpacing;
    });

    return this;
  }

  /**
   * Remove all svg elements
   */
  destroy = () => {
    this.object.remove();
  };

  /**
   * setPosition - update the node's position
   *
   * @param {number} x position in x
   * @param {number} y position in y
   */
  setPosition = (x, y) => {
    // do not update the position if the value is out of boundaries
    if (!this.canvas.inBoundaries(x, y)) return;

    // update the svg attributes
    this.object.attr("x", x).attr("y", y);

    // update the visualization data
    this.data.Visualization[0] = x;
    this.data.Visualization[1] = y;
  };

  /**
   * setPositionDelta - set position by providing delta x and y
   *
   * @param {number} dx delta x
   * @param {number} dy delta y
   */
  setPositionDelta = (dx, dy) => {
    const x = this.posX + (dx || 0);
    const y = this.posY + (dy || 0);
    this.setPosition(x, y);
  };

  /**
   * eventsOn - call the function if the node's events are enabled
   *
   * @param {function} fn function to call if the node's events are enabled
   */
  eventsOn = fn => {
    if (this.visible) fn();
  };

  /**
   * @private
   * Check if event target element is a node port
   *
   * @param {node} target element target of the event to be checked
   */
  isPort = target => {
    const targetElementType = target.nodeName;
    const targetClasses = target.className.baseVal;
    return targetElementType === "circle" && targetClasses.includes("port");
  };

  /**
   * @private
   * On mouse down event
   *
   */
  onMouseDown = () => {
    // Exit function if click is on port
    if (this.isPort(d3.event.target)) return;
    // Continue otherwise
    d3.event.stopPropagation();

    // shift key pressed
    const { shiftKey } = d3.event;

    if (!this.selected && !shiftKey) {
      this.canvas.setMode("default", { event: "onMouseDown" });
    }
  };

  /**
   * @private
   * On mouse enter node event
   */
  onMouseEnter = () => {
    this.canvas.hoveredNode = this;
  };

  /**
   * @private
   * On mouse leave node event
   */
  onMouseLeave = () => {
    this.canvas.hoveredNode = null;
  };

  /**
   * @private
   * onClick - on click event
   *
   */
  onClick = () => {
    d3.event.stopPropagation();

    // shift key pressed
    const { shiftKey } = d3.event;
    this.handleSelectionChange(shiftKey);
  };

  /**
   * @private
   * Double click event
   *
   */
  onDblClick = () => {
    d3.event.preventDefault();
    d3.event.stopPropagation();

    // clear click timeout
    clearTimeout(this.dbClickTimeout);

    // set mode to double click
    this.canvas.setMode("onDblClick", { node: this }, true);
  };

  /**
   * @private
   * On context event
   *
   */
  onContext = () => {
    d3.event.preventDefault();
    d3.event.stopPropagation();

    // set mode to node context menu
    this.canvas.setMode("nodeCtxMenu", { node: this, event: d3.event }, true);
  };

  /**
   * @private
   * On start dragging node event
   *
   */
  onDragStart = () => {
    // change the cursor style
    this.object.style("cursor", "move");

    this._drag.delta.x = this.object.attr("x") - d3.event.x;
    this._drag.delta.y = this.object.attr("y") - d3.event.y;
  };

  /**
   * @private
   * On stop dragging node event
   */
  onDragEnd = () => {
    // change the cursor style
    this.object.style("cursor", "default");

    if (this.canvas.mode.current.id === "drag") {
      this.canvas.mode.previous.id === "selectNode"
        ? this.canvas.setPreviousMode()
        : this.canvas.setMode("default");
    }
  };

  /**
   * @private
   * On drag node event
   *
   */
  onDrag = () => {
    // this will only set the mode once
    // done here to filter from click events
    this.canvas.setMode("drag", this);
    const { delta } = this._drag;

    // set the node position
    this.setPosition(d3.event.x + delta.x, d3.event.y + delta.y);

    // trigger the onDrag event
    if ("onDrag" in this.events) this.events.onDrag(this, d3.event);

    const _onDrag = this.canvas.mode.current?.onDrag ?? {
      next: () => {
        /* empty method */
      }
    };

    _onDrag.next(this);
  };

  handleSelectionChange(shiftKey) {
    clearTimeout(this.dbClickTimeout);
    this.dbClickTimeout = setTimeout(() => {
      // toggle node selection
      const selection = !this.selected;

      // shift key not pressed, set mode to default
      if (!shiftKey) this.canvas.setMode(EVT_NAMES.DEFAULT, null);

      // set the node selection
      this.selected = selection;

      // node selected mode
      this.canvas.setMode(
        EVT_NAMES.SELECT_NODE,
        { nodes: [this], shiftKey },
        true
      );
    }, 100);
  }

  /**
   * @private
   * On update the node position
   *
   */
  updatePosition(data) {
    // ignore position update if dragging
    if (this.canvas.mode.current.id === "drag") return;

    // keys x and y are received separatly
    const updatedPos = { ...this.data.Visualization, ...data.Visualization };

    // convert format
    const visualizationData = {
      Visualization: convertVisualization(updatedPos)
    };

    // set object new position
    this.data = { ...this.data, ...visualizationData };

    // set svg new posistion
    this.object.attr("x", this.posX).attr("y", this.posY);

    // execute onDrag callbacks to trigger links render
    if ("onDrag" in this.events)
      this.events.onDrag(this, { x: this.posX, y: this.posY });
  }

  /**
   * @private
   * updateTemplate
   */
  updateTemplate = async () => {
    this.object.select("rect").attr("class", convertTypeCss(this._template));

    await this.update();
    this.updateSize();

    return this;
  };

  /**
   * @private
   * Update graphical representation
   */
  update = () => {
    this.addPorts().renderHeader().renderStatus().renderPorts();
    return Promise.resolve(this);
  };

  /**
   *
   * @param {*} data
   * @returns
   */
  updateNode = data => {
    const fn = {
      Visualization: _data => this.updatePosition(_data), // Position changes when dragging or when adding a new node
      default: _data => {
        this.data = { ...this.data, ...data };
        this.updatePosition(_data);
        this.data.name = this.name;
      }
    };
    Object.keys(data).forEach(key => {
      (fn[key] || fn["default"])(data);
      if (!this.noReloadRequired.includes(key)) this.init().addToCanvas();
    });
    return true;
  };

  /**
   * onPortClick - port click event handler
   *
   * @param {object} port port object
   */
  onPortClick = port => {
    const currMode = this.canvas.mode.current;

    // skip event if pressing shift while on selectNode mode
    if (d3.event.shiftKey && currMode.id === "selectNode") return;

    const actions = {
      // start linking mode if on default mode
      default: () => {
        this.canvas.setMode("linking", {
          src: port,
          link: null,
          trg: null,
          toCreate: false
        });
      },
      selectNode: () => {
        this.canvas.setMode("default");
        this.canvas.setMode("linking", {
          src: port,
          link: null,
          trg: null,
          toCreate: false
        });
      },
      // finish linking
      linking: () => {
        const { src } = currMode.props;
        // validate here to keep linking if it is not valid
        if (!currMode.props.link.isValid(src, port)) return;
        currMode.props.trg = port;
        currMode.props.toCreate = true;
        this.canvas.setMode("default");
      }
    };

    const defaultAction = () => {
      console.debug("Default mode required to start linking");
    };

    // call an action
    const actualAction = actions?.[currMode.id] ?? defaultAction;

    actualAction.call();
  };

  /**
   * onPortMouseOver - port onmouseover event handler
   *
   * @param {object} port port object
   */
  onPortMouseOver = port => {
    this.canvas.events.next({
      name: "onMouseOver",
      type: "Port",
      event: d3.event,
      port
    });
  };

  /**
   * onPortMouseOver - port onmouseout event handler
   *
   * @param {object} port port object
   */
  onPortMouseOut = port => {
    this.canvas.events.next({
      name: "onMouseOut",
      type: "Port",
      event: d3.event,
      port
    });
  };

  onPortContext = port => {
    this.canvas.setMode("portCtxMenu", { port: port, event: d3.event }, true);
  };

  /**
   * onSelected - on node selected event handler
   */
  onSelected = () => {
    const { stroke } = STYLE;
    this.object
      .select("rect")
      .attr(
        "stroke",
        this.selected ? stroke.color.selected : stroke.color.default
      )
      .attr(
        "stroke-width",
        this.selected ? stroke.width.selected : stroke.width.default
      );
  };

  /**
   * onTemplateUpdate - on template update event handler
   * templates only change when edited while in redis
   *
   * @param {string} data node's template name
   */
  onTemplateUpdate = async data => {
    const isNotInnerTemplate = !(
      this.data.type === TYPES.CONTAINER && this.template?.NodeInst[data.Label]
    );
    if (data.Label !== this.templateName && isNotInnerTemplate) return; // not my template and if I'm a flow and it's not a children node

    isNotInnerTemplate &&
      (this._template = Object.assign(this._template, data));
    await this.updateTemplate();
  };

  /**
   * onGroupsChange - on groups event handler
   *
   * @param {object} groups flow groups
   */
  onGroupsChange = groups => {
    const nodeGroups = this.data.NodeLayers ?? [];
    const hide =
      nodeGroups.every(group => {
        const groupItem = groups.get(group);
        if (groupItem) {
          return !groupItem.enabled;
        }
        return false;
      }) && nodeGroups.length > 0;
    this.visibility = !hide;
  };

  /**
   * addToCanvas - append node element to canvas
   *
   */
  addToCanvas() {
    this.canvas.append(() => {
      return this.el;
    });
  }

  /**
   * deleteKey - set node data key to null
   *
   * @param {object} data node's data
   */
  deleteKey = data => {
    const path = flattenObject(data);
    Object.keys(path).forEach(pkey => {
      this.data = _omit(this.data, pkey);
    });
    return this.isValid();
  };

  /**
   * isValid - Check if any of the required keys was deleted
   * Delete node if true
   */
  isValid = () => {
    return !this.requiredKeys.some(key => {
      // null: key was already deleted
      return this.data[key] === null || !(key in this.data);
    });
  };

  /**
   * linking - enable/disable ports linking state
   *
   * @param {object} portData port data object, pass undefined to set port to default state
   */
  linking = portData => {
    this._ports.forEach(port => {
      port.setLinking(portData);
    });
  };

  /**
   * setExposedPort - toggle exposed port value
   *
   * @param {string} portName name of the port
   * @param {boolean} value true to set to exposed, false otherwise
   */
  setExposedPort = (portName, value) => {
    const port = this._ports.get(portName);
    if (port) port.exposed = value;
  };

  /**
   * Update node parameters
   * @param {Object} params : new params
   */
  setParams = params => {
    this.data.Parameter = params;
  };

  /**
   * getExposedName - returns the node's template name
   *
   * @returns {string} node's template name
   */
  getExposedName() {
    return this.templateName;
  }

  /**
   * getMiniature - Get svg d3 object with node miniature
   *
   * @param {string} templateName: Node/Container template name
   * @param {string} type: "node" or "flow" or "start"
   * @param {number} offsetX: Starting point of svg "x" attribute
   */
  static async getMiniature(template, _type = "node", offsetX = 30) {
    const { width, height, padding } = MINI;
    // create the svg element
    const { stroke } = STYLE;
    const object = d3
      .create("svg")
      .style("overflow", "visible")
      .attr("width", width + padding)
      .attr("height", height)
      .attr("x", offsetX);

    // add a rect to the svg element
    // this is the body of the node
    object
      .append("rect")
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("width", width)
      .attr("height", height)
      .attr("class", convertTypeCss(template, true))
      .attr("stroke", stroke.color.default)
      .attr("stroke-width", stroke.width.default);
    // Add status
    // create the node status instance
    const status = new BaseNodeStatus(width / 2, height / 2, "grey", 5);
    // append to the svg element
    object.append(() => {
      return status.el;
    });
    // return node
    return object;
  }
}

export default BaseNode;
