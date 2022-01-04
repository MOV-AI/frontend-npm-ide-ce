import * as d3 from "d3";
import _get from "lodash/get";

import { port_convert_type_css } from "../Utils";
import { isLinkeable } from "./PortValidator";

// ports that accept links with any other message type
const ports_any = ["movai_msgs/Any"];

class BasePortStruct {
  constructor(
    node,
    {
      name,
      type,
      Callback,
      Message,
      Template,
      Package,
      Parameter,
      Exposed,
      origin
    }
  ) {
    this.node = node;
    this.data = {
      name: name,
      type: type,
      callback: Callback || "",
      message: Message || "",
      template: Template || "",
      package: Package || "",
      parameters: Parameter || {},
      exposed: Exposed || false,
      origin: origin || null
    };
    this.required_keys = ["message", "template"];
    this._selected = false;
    this._visible = true;
  }

  get visible() {
    return this._visible;
  }

  set visible(value) {
    this._visible = value;
  }
}

class BasePort extends BasePortStruct {
  constructor(node, data, events) {
    super(node, data);
    this.events = events;
    this.object = null;
    this.color = "white";
    this.radius = 10;
    this.cx = 0;
    this.cy = 0;
    this.links = new Map();
    this.css = {
      default: () =>
        `${port_convert_type_css(this.data.message)} ${this.cssExposed}`,
      unlinkeable: () => `port-disabled ${this.cssExposed}`,
      //mouseover: ()=>`port-over ${this.cssExposed}`,
      opacity: { default: 1, unlinkeable: 0.5 }
    };
    this.linking = false;

    this._render()._addEvents();
  }

  destroy = () => {
    this.object.remove();
  };

  _render() {
    this.object = d3
      .create("svg:circle")
      .attr("cx", this.cx)
      .attr("cy", this.cy)
      .attr("r", this.radius)
      .attr("stroke-width", 0)
      .attr("class", this.css.default());

    return this;
  }

  _addEvents() {
    this.object.on("click", () => this._eventsOn(this._onClick, false));
    this.object.on("mouseenter", () => {
      this._eventsOn(this._onMouseOver);
    });
    this.object.on("mouseout", () => {
      this._eventsOn(this._onMouseOut);
    });
    this.object.on("contextmenu", () => this._eventsOn(this._onContext));

    return this;
  }

  _eventsOn = (fn, availableInReadOnly = true) => {
    d3.event.preventDefault();
    d3.event.stopPropagation();

    const { visible, readOnly } = this;
    if (visible && (availableInReadOnly || !readOnly)) fn();
  };

  _onClick = () => {
    _get(this.events, "onClick", () => {})(this);
  };

  _onMouseOver = () => {
    _get(this.events, "onMouseOver", () => {})(this);
  };

  _onMouseOut = () => {
    _get(this.events, "onMouseOut", () => {})(this);
  };

  _onContext = () => {
    _get(this.events, "onContext", () => {})(this);
  };

  get el() {
    return this.object.node();
  }

  get type() {
    return this.data.type;
  }

  get position() {
    const node = this.node;
    return {
      data: this.data,
      nodeSize: { height: node.height, width: node.width },
      center: node.center,
      x: node.posX + this.cx,
      y: node.posY + this.cy
    };
  }

  /**
   * Check if port message accepts links from ports with different message type
   */
  get acceptsAny() {
    return ports_any.includes(this.data.message);
  }

  get exposed() {
    return this.data.exposed;
  }

  get readOnly() {
    return this.node.canvas.readOnly;
  }

  set exposed(value) {
    this.data.exposed = value;
    this.object.attr("class", this.css.default());
  }

  get cssExposed() {
    return this.data.exposed ? "port-exposed" : "";
  }

  checkAny = (msg_PA, msg_PB) => {
    return [msg_PA, msg_PB].some(msg => ports_any.includes(msg));
  };

  setPosition(x = this.cx, y = this.cy, r = this.radius) {
    this.cx = x;
    this.cy = y;
    this.radius = r;
    this.object.attr("cx", this.cx).attr("cy", this.cy).attr("r", this.radius);
  }

  setClass = value => {
    this.object.attr("class", value);
  };

  /**
   * while linking set port opacity if message is not equal
   * @param {string} data port data; undefined sets default opacity
   */
  setLinking = data => {
    const message = _get(data, "message", this.data.message);
    const type = _get(data, "type", "");

    this.linking = message;

    const css = isLinkeable({ message, type }, this.data)
      ? this.css.default()
      : this.css.unlinkeable();
    this.setClass(css);
  };

  /**
   * Check if any of the required keys was deleted
   * Delete node if true
   */
  isValid = () => {
    return !this.required_keys.some(key => {
      // null: key was already deleted
      return [null, undefined, ""].includes(this.data[key]);
    });
  };

  static parsePortname = name => {
    const arr = name.split("/");
    const [p1, p2] = [arr.slice(0, -1).join("/"), arr.slice(-1).join()];
    const out1 = ["in", "out"].includes(p2.toLowerCase()) ? null : p2;
    return [p1, out1].filter(val => val !== null).join("/");
  };
}

export default BasePort;
