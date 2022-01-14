import { convert_visualization } from "../Utils";
import { maxMovingPixels } from "../../../Constants/constants";

export default class BaseNodeStruct {
  constructor(data) {
    this.data = {
      id: data.id,
      NodeLabel: data.NodeLabel || "",
      CmdLine: data.CmdLine || [],
      name: data.NodeLabel, // standard way to get NodeLabel, StateLabel, ContainerLabel
      Parameter: data.Parameter || {},
      Template: data.Template || "",
      Visualization: convert_visualization(data.Visualization) || [50, 50],
      NodeLayers: data.NodeLayers || [],
      Persistent: data.Persistent,
      Remappable: data.Remappable,
      Launch: data.Launch,
      type: "NodeInst",
      model: "Node"
    };
    // these keys are required i norder to maintain the node valid
    // if any is deleted then the node must be deleted
    this.required_keys = ["NodeLabel", "Template", "Visualization"];
    this.no_reload_required = [
      "Dummy",
      "Persistent",
      "NodeLayers",
      "Parameter",
      "CmdLine",
      "EnvVar",
      "Visualization"
    ];
    this._template = null;
    this._ports = new Map();
    this._header = null;
    this.min_size = { h: 50, w: 50 };
    this.padding = { x: 25, y: 3 };
    this.ports_spacing = 10;
    this._status = false; // true -> running: flase -> stopped
    this._visible = true;
  }

  get posX() {
    const x = this.data.Visualization[0];
    return x <= 1 ? x / (1 / maxMovingPixels) : x;
  }

  get posY() {
    const y = this.data.Visualization[1];
    return y < 1 ? y / (1 / maxMovingPixels) : y;
  }

  get width() {
    return this.min_size.w;
  }

  get height() {
    return Math.max(this.getHeight(), this.min_size.h);
  }

  get center() {
    return {
      xCenter: this.posX + this.width / 2,
      yCenter: this.posY + this.height / 2
    };
  }

  get visible() {
    return this._visible;
  }

  set visible(value) {
    this._visible = Boolean(value);
  }

  /**
   * @private
   * Calculate max number of ports between in and out
   * Returns: {max, in, out}
   */
  // TODO: Refactor
  getNrOfPorts = () => {
    let ctr_in = 0;
    let ctr_out = 0;
    this._ports.forEach(port => {
      port.type === "In" ? (ctr_in += 1) : (ctr_out += 1);
    });
    return { Max: Math.max(ctr_in, ctr_out), In: ctr_in, Out: ctr_out };
  };

  /**
   * @private
   * Calculate node height based on the max nr. of ports per type
   */
  getHeight = () => {
    const min_ports = 5;
    const min_height = this.ports_spacing * min_ports;
    const height = (this.getNrOfPorts().Max + 1) * this.ports_spacing;
    return Math.max(min_height, height);
  };

  /**
   * @private
   * @param {*} type
   * @returns
   */
  getPortsInitialPos = type => {
    const nr_of_ports = this.getNrOfPorts();
    const Height = this.getHeight();
    const init_x = {
      In: this.padding.x / 2,
      Out: this.width + this.padding.x / 2
    };

    const init_y =
      Height / 2 -
      ((nr_of_ports[type] - 1) * this.ports_spacing) / 2 +
      this.padding.y;

    return [init_x[type], init_y];
  };

  getPortPos = port_name => {
    const port = this._ports.get(port_name);
    if (port) {
      return port.position;
    }
    return undefined;
  };
}
