import * as d3 from "d3";

import { portConvertTypeCss } from "../Utils";
import { isLinkeable } from "./PortValidator";

// ports that accept links with any other message type
const portsAny = ["movai_msgs/Any"];

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
      name,
      type,
      callback: Callback || "",
      message: Message || "",
      template: Template || "",
      package: Package || "",
      parameters: Parameter || {},
      exposed: Exposed || false,
      origin: origin || null
    };
  }

  requiredKeys = ["message", "template"];
  _visible = true;

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
    this.css = {
      default: () =>
        `${portConvertTypeCss(this.data.message)} ${this.cssExposed}`,
      unlinkeable: () => `port-disabled ${this.cssExposed}`,
      //mouseover: ()=>`port-over ${this.cssExposed}`,
      opacity: { default: 1, unlinkeable: 0.5 }
    };

    this.render().addEvents();
  }

  object = null;
  color = "white";
  radius = 10;
  cx = 0;
  cy = 0;
  links = new Map();
  linking = false;

  destroy = () => {
    this.object.remove();
  };

  render() {
    const css = this.css.default();
    this.object = d3
      .create("svg:circle")
      .attr("cx", this.cx)
      .attr("cy", this.cy)
      .attr("r", this.radius)
      .attr("stroke-width", 0)
      .attr("class", css);

    return this;
  }

  addEvents() {
    this.object.on("click", () => this.eventsOn(this.onClick, false));
    this.object.on("mouseenter", () => {
      this.eventsOn(this.onMouseOver);
    });
    this.object.on("mouseout", () => {
      this.eventsOn(this.onMouseOut);
    });
    this.object.on("contextmenu", () => this.eventsOn(this.onContext));

    return this;
  }

  eventsOn = (fn, availableInReadOnly = true) => {
    d3.event.preventDefault();
    d3.event.stopPropagation();

    const { visible, readOnly } = this;
    if (visible && (availableInReadOnly || !readOnly)) fn();
  };

  onClick = () => {
    this.callFunction(this.events.onClick, this);
  };

  onMouseOver = () => {
    this.callFunction(this.events.onMouseOver, this);
  };

  onMouseOut = () => {
    this.callFunction(this.events.onMouseOut, this);
  };

  onContext = () => {
    this.callFunction(this.events.onContext, this);
  };

  get el() {
    return this.object.node();
  }

  get type() {
    return this.data.type;
  }

  get position() {
    const { node, data } = this;
    return {
      data,
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
    return portsAny.includes(this.data.message);
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

  checkAny = (msgPA, msgPB) => {
    return [msgPA, msgPB].some(msg => portsAny.includes(msg));
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
    const message = data?.message ?? this.data.message;
    const type = data?.type ?? "";

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
    return this.requiredKeys.every(key => !!this.data[key]);
  };

  /**
   * Call a function
   * @param  {...any} args : First argument should be a function and the other
   *  arguments will be passed to it
   * @returns The output of the called function
   */
  callFunction = (...args) => {
    const [fn, ...otherArgs] = args;
    if (typeof fn === "function") return fn(...otherArgs);
  };

  static parsePortname = name => {
    const arr = name.split("/");
    const [p1, p2] = [arr.slice(0, -1).join("/"), arr.slice(-1).join()];
    const out1 = ["in", "out"].includes(p2.toLowerCase()) ? null : p2;
    return [p1, out1].filter(val => val !== null).join("/");
  };
}

export default BasePort;
