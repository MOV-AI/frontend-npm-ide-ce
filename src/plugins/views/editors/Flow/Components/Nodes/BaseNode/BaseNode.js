import * as d3 from "d3";
import lodash from "lodash";
import { convert_visualization } from "../Utils";
import { flattenObject } from "../../../../_shared/Utils/Utils";

import BaseNodeStruct from "./BaseNodeStruct";
import BasePort from "./BasePort";
import BaseNodeHeader from "./BaseNodeHeader";
import { NodesDB } from "../../../../../api/NodesDB";
import { convert_type_css, getBaseTemplate } from "../Utils";
import BaseNodeStatus from "./BaseNodeStatus";

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
 * Extend it and call _init in the constructor
 */
class BaseNode extends BaseNodeStruct {
  /**
   *
   * @param {object} canvas the canvas where the node will be added
   * @param {object} node node's data
   * @param {object} events functions to be called on node's events
   */
  constructor(canvas, node, events, _type, template) {
    super(node);
    this.canvas = canvas;
    this.events = events;
    this._type = _type || "node";
    this.object = null;
    this._nodesDb = new NodesDB();
    this._selected = false;
    this._drag = { handler: null, debounce: null, delta: { x: 0, y: 0 } };
    this.db_click_timeout = null;
    this._template = template;
  }

  /**
   * initialize the node element
   */
  _init() {
    this._loadTemplate()
      ._addPorts()
      ._renderBody()
      ._renderHeader()
      ._renderPorts()
      ._renderStatus()
      ._addEvents();

    return this;
  }

  /**
   * _loadTemplate - load the node template
   */
  _loadTemplate() {
    if (this._template) return this;
    this._loadTemplateFromArchive();
    return this;
  }

  _loadTemplateFromArchive = async () => {
    try {
      if (!this.data.Template) return;
      const tpl = await this._nodesDb.agetTemplate(
        this._type,
        this.data.Template
      );

      this._template = { ...this._template, ...tpl };
      this._updateTemplate();
    } catch (error) {
      console.log(error);
    }

    return this;
  };

  /**
   * _renderBody - render the body of the node
   */
  _renderBody() {
    const { stroke } = STYLE;
    const { padding } = this;
    const maxPadding = Math.max(padding.x, padding.y);

    // object already exists; probably an update request
    if (this.object) this.object.remove();

    // create the svg element
    this.object = d3
      .create("svg")
      .attr("id", `${this.canvas.canvasId}-${this.data.id}`)
      .style("overflow", "visible")
      .attr("width", this.width + maxPadding)
      .attr("height", this.height + maxPadding)
      .attr("x", this.posX)
      .attr("y", this.posY);

    // add a rect to the svg element
    // this is the body of the node
    this.object
      .append("rect")
      .attr("x", padding.x / 2)
      .attr("y", padding.y)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("class", convert_type_css(this._template))
      .attr("filter", `url(#shadow-${this.canvas.canvasId})`)
      .attr("stroke", stroke.color.default)
      .attr("stroke-width", stroke.width.default);

    return this;
  }

  /**
   * _updateSize - update the size of the node (used after a template update)
   */
  _updateSize = () => {
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
   * _addEvents - add events to the svg element
   */
  _addEvents = () => {
    // node event listeners
    this.object.on("click", () => this._eventsOn(this._onClick));
    this.object.on("mousedown", () => this._eventsOn(this._onMouseDown));
    this.object.on("mouseenter", () => this._eventsOn(this._onMouseEnter));
    this.object.on("mouseleave", () => this._eventsOn(this._onMouseLeave));
    this.object.on("dblclick", () => this._eventsOn(this._onDblClick));

    this.object.on("contextmenu", () => this._eventsOn(this._onContext));

    this._addDrag();

    return this;
  };

  _addDrag = () => {
    if (this.readOnly) return this;
    // assign drag handler to node object
    this._drag.handler = d3
      .drag()
      .on("start", () => this._eventsOn(this._onDragStart))
      .on("end", () => this._eventsOn(this._onDragEnd))
      .on("drag", () => this._eventsOn(this._onDrag));
    this._drag.handler(this.object);
    return this;
  };

  /**
   * _renderHeader - render the node header
   */
  _renderHeader() {
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
   * _renderStatus - render the status of the node (circle on the body)
   */
  _renderStatus = () => {
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

  _portEvents() {
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
   * _addPorts - add node ports
   */
  _addPorts(
    portBuilder = (node, data, events) => new BasePort(node, data, events)
  ) {
    // port events
    const events = this._portEvents();

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
      const ports = lodash.get(this._template, "template.PortsInst", {});

      Object.keys(ports).forEach(port_inst_name => {
        // check In and Out ports
        ["In", "Out"].forEach(type => {
          // get port data
          const data = lodash.get(ports[port_inst_name], `${type}`, {});

          Object.keys(data).forEach(port_name => {
            // customize port data for the instance
            const port_data = {
              name: `${port_inst_name}/${port_name}`,
              type: type,
              Template: lodash.get(ports, `${port_inst_name}.Template`, ""),
              ...data[port_name]
            };

            // create port instance
            const port = portBuilder(this, port_data, events);

            // check if the create port is valid
            if (port.isValid()) {
              // add port instance
              const fmt_port_name = `${port_inst_name}/${port_name}`;
              this._ports.set(fmt_port_name, port);
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
   * _renderPorts - render ports. should be called after adding the ports
   */
  _renderPorts() {
    const radius = this.port_size;
    const position = {
      In: this._getPortsInitialPos("In"),
      Out: this._getPortsInitialPos("Out")
    };

    this._ports.forEach(port => {
      // append port to the svg element
      this.object.append(() => {
        port.setPosition(...position[port.type], radius);
        return port.el;
      });

      // increment ports position
      position[port.type][1] += this.ports_spacing;
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
   * el - returns svg element
   *
   * @returns {object} svg element
   */
  get el() {
    return this.object.node();
  }

  /**
   * name - returns the name of the node
   *
   * @returns {string} name of the node
   */
  get name() {
    return this.data.NodeLabel;
  }

  /**
   * port_size - returns the port size
   *
   * @returns {number} port size
   */
  get port_size() {
    return this.min_size.w * 0.07;
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
   * template_name - returns the node's template name
   *
   * @returns {string} the template name
   */
  get template_name() {
    return this.data.Template;
  }

  /**
   * events_on - returns if the events should be triggered based on the node visibility
   *
   * @returns {boolean} true is node is visible, otherwise false
   */
  get events_on() {
    return this.visible;
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
   * _eventsOn - call the function if the node's events are enabled
   *
   * @param {function} fn function to call if the node's events are enabled
   */
  _eventsOn = fn => {
    if (this.visible) fn();
  };

  /**
   * _isPort - check if event target element is a node port
   *
   * @param {node} target element target of the event to be checked
   */
  _isPort = target => {
    const targetElementType = target.nodeName;
    const targetClasses = target.className.baseVal;
    return targetElementType === "circle" && targetClasses.includes("port");
  };

  /**
   * _onMouseDown - on mouse down event
   *
   */
  _onMouseDown = () => {
    // Exit function if click is on port
    if (this._isPort(d3.event.target)) return;
    // Continue otherwise
    d3.event.stopPropagation();

    // shift key pressed
    const { shiftKey } = d3.event;

    if (!this.selected && !shiftKey) {
      this.canvas.setMode("default", { event: "_onMouseDown" });
    }
  };

  /**
   * _onMouseEnter - on mouse enter node event
   */
  _onMouseEnter = () => {
    this.canvas.hoveredNode = this;
  };

  /**
   * _onMouseLeave - on mouse leave node event
   */
  _onMouseLeave = () => {
    this.canvas.hoveredNode = null;
  };

  /**
   * _onClick - on click event
   *
   */
  _onClick = () => {
    d3.event.stopPropagation();

    // shift key pressed
    const { shiftKey } = d3.event;

    // debounce timeout
    clearTimeout(this.db_click_timeout);

    this.db_click_timeout = setTimeout(() => {
      // toggle node selection
      const selection = !this.selected;

      // shift key not pressed, set mode to default
      if (!shiftKey) this.canvas.setMode("default", null);

      // set the node selection
      this.selected = selection;

      // node selected mode
      this.canvas.setMode("selectNode", { nodes: [this], shiftKey }, true);
    }, 100);
  };

  /**
   * _onDblClick - double click event
   *
   */
  _onDblClick = () => {
    d3.event.preventDefault();
    d3.event.stopPropagation();

    // clear click timeout
    clearTimeout(this.db_click_timeout);

    // set mode to double click
    this.canvas.setMode("onDblClick", { node: this }, true);
  };

  /**
   * _onContext - context event
   *
   */
  _onContext = () => {
    d3.event.preventDefault();
    d3.event.stopPropagation();

    // set mode to node context menu
    this.canvas.setMode("nodeCtxMenu", { node: this, event: d3.event }, true);
  };

  /**
   * _onDragStart - start dragging node event
   *
   */
  _onDragStart = () => {
    // change the cursor style
    this.object.style("cursor", "move");

    this._drag.delta.x = this.object.attr("x") - d3.event.x;
    this._drag.delta.y = this.object.attr("y") - d3.event.y;
  };

  /**
   * _onDragEnd - stop dragging node event
   */
  _onDragEnd = () => {
    // change the cursor style
    this.object.style("cursor", "default");

    if (this.canvas.mode.current.id === "drag") {
      this.canvas.mode.previous.id === "selectNode"
        ? this.canvas.setPreviousMode()
        : this.canvas.setMode("default");
    }
  };

  /**
   * _onDrag - while dragging node event
   *
   */
  _onDrag = () => {
    // this will only set the mode once
    // done here to filter from click events
    this.canvas.setMode("drag", this);
    const { delta } = this._drag;

    // set the node position
    this.setPosition(d3.event.x + delta.x, d3.event.y + delta.y);

    // trigger the onDrag event
    if ("onDrag" in this.events) this.events.onDrag(this, d3.event);
    lodash
      .get(this.canvas.mode.current, "onDrag", {
        next: () => {}
      })
      .next(this);
  };

  /**
   * _updatePosition - update the node position
   *
   */
  _updatePosition(data) {
    // ignore position update if dragging
    if (this.canvas.mode.current.id === "drag") return;

    // keys x and y are received separatly
    const updated_pos = { ...this.data.Visualization, ...data.Visualization };

    // convert format
    const _data = { Visualization: convert_visualization(updated_pos) };

    // set object new position
    this.data = lodash.merge(this.data, _data);

    // set svg new posistion
    this.object.attr("x", this.posX).attr("y", this.posY);

    // execute onDrag callbacks to trigger links render
    if ("onDrag" in this.events)
      this.events.onDrag(this, { x: this.posX, y: this.posY });
  }

  /**
   * _updateTemplate -
   */
  _updateTemplate = () => {
    this.object.select("rect").attr("class", convert_type_css(this._template));
    this._update();

    return this;
  };

  /**
   * _update - update graphical representation
   */
  _update = () => {
    this._addPorts()._renderPorts()._updateSize()._renderStatus();

    return this;
  };

  /**
   * onPortClick - port click event handler
   *
   * @param {object} port port object
   */
  onPortClick = port => {
    const curr_mode = this.canvas.mode.current;

    // skip event if pressing shift while on selectNode mode
    if (d3.event.shiftKey && curr_mode.id === "selectNode") return;

    const actions = {
      // start linking mode if on default mode
      default: () => {
        this.canvas.setMode("linking", {
          src: port,
          link: null,
          trg: null,
          to_create: false
        });
      },
      selectNode: () => {
        this.canvas.setMode("default");
        this.canvas.setMode("linking", {
          src: port,
          link: null,
          trg: null,
          to_create: false
        });
      },
      // finish linking
      linking: () => {
        const { src } = curr_mode.props;
        // validate here to keep linking if it is not valid
        if (!curr_mode.props.link.is_valid(src, port)) return;
        curr_mode.props.trg = port;
        curr_mode.props.to_create = true;
        this.canvas.setMode("default");
      }
    };

    // call an action
    lodash
      .get(actions, curr_mode.id, () => {
        console.debug("Default mode required to start linking");
      })
      .call();
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
      data: { port, mouseover: true }
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
      data: { port, mouseover: false }
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
   * @param {string} template_name node's template name
   */
  onTemplateUpdate = template_name => {
    if (template_name !== this.template_name) return; //not my template
    this._template = undefined;
    this._loadTemplate()._update();
  };

  /**
   * onLayersChange - on layers event handler
   *
   * @param {object} layers flow layers
   */
  onLayersChange = layers => {
    const nodeLayers = lodash.get(this.data, "NodeLayers", []);
    const hide =
      nodeLayers.every(layer => {
        if (layer in layers) {
          return layers[layer].on ? false : true;
        }
        return false;
      }) && nodeLayers.length > 0;
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
   * update - update node
   *
   * @param {object} data updated node data
   */
  update = data => {
    const fn = {
      Visualization: data => this._updatePosition(data), // Position changes when dragging or when adding a new node
      default: () => {
        lodash.merge(this.data, data);
        this.data.name = this.name;
      }
    };
    Object.keys(data).forEach(key => {
      (fn[key] || fn["default"])(data);
      if (!this.no_reload_required.includes(key)) this._init().addToCanvas();
    });
    return true;
  };

  /**
   * deleteKey - set node data key to null
   *
   * @param {object} data node's data
   */
  deleteKey = data => {
    const path = flattenObject(data);
    Object.keys(path).forEach(pkey => {
      this.data = lodash.omit(this.data, pkey);
    });
    return this.isValid();
  };

  /**
   * isValid - Check if any of the required keys was deleted
   * Delete node if true
   */
  isValid = () => {
    return !this.required_keys.some(key => {
      // null: key was already deleted
      return this.data[key] === null || !(key in this.data);
    });
  };

  /**
   * linking - enable/disable ports linking state
   *
   * @param {object} port_data port data object, pass undefined to set port to default state
   */
  linking = port_data => {
    this._ports.forEach(port => {
      port.setLinking(port_data);
    });
  };

  /**
   * setExposedPort - toggle exposed port value
   *
   * @param {string} port_name name of the port
   * @param {boolean} value true to set to exposed, false otherwise
   */
  setExposedPort = (port_name, value) => {
    const port = this._ports.get(port_name);
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
    return this.template_name;
  }

  /**
   * getMiniature - Get svg d3 object with node miniature
   *
   * @param {string} templateName: Node/Container template name
   * @param {string} type: "node" or "flow" or "start"
   * @param {number} offsetX: Starting point of svg "x" attribute
   */
  static async getMiniature(templateName, type = "node", offsetX = 30) {
    const template =
      (await BaseNode.getNodeTemplate(templateName, type)) ??
      getBaseTemplate(type);
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
      .attr("class", convert_type_css(template, true))
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

  static getNodeTemplate = async (templateName, _type = "node") => {
    if (!templateName || _type === "start" || _type === "flow")
      return undefined;

    try {
      const templates = new NodesDB();
      return await templates.agetTemplate(_type, templateName);
    } catch (error) {
      console.log("Could not find template in archive", error);
      return {};
    }
  };

  static builder = async (canvas, node, events, _type) => {
    const tpl = await BaseNode.getNodeTemplate(node.Template, "node");

    return new BaseNode(canvas, node, events, _type, tpl);
  };
}

export default BaseNode;
