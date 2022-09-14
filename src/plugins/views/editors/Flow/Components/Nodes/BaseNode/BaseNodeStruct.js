import { convertVisualization } from "../Utils";
import { MAX_MOVING_PIXELS, TYPES } from "../../../Constants/constants";

export default class BaseNodeStruct {
  constructor(data) {
    this.data = {
      id: data.id,
      NodeLabel: data.NodeLabel || "",
      CmdLine: data.CmdLine || [],
      name: data.NodeLabel, // standard way to get NodeLabel, StateLabel, ContainerLabel
      Parameter: data.Parameter || {},
      Template: data.Template || "",
      Visualization: convertVisualization(data.Visualization) || [50, 50],
      NodeLayers: data.NodeLayers || [],
      Persistent: data.Persistent,
      Remappable: data.Remappable,
      Launch: data.Launch,
      type: TYPES.NODE,
      model: "Node"
    };
  }

  // these keys are required in order to maintain the node valid
  // if any is deleted then the node must be deleted
  requiredKeys = ["NodeLabel", "Template", "Visualization"];
  // when any of those keys changes, it doesn't require to reload canvas
  noReloadRequired = [
    "Dummy",
    "Persistent",
    "NodeLayers",
    "Parameter",
    "CmdLine",
    "EnvVar",
    "Visualization"
  ];

  _ports = new Map();
  minSize = { h: 50, w: 50 };
  padding = { x: 25, y: 3 };
  portsSpacing = 10;
  _visible = true;

  get posX() {
    const x = this.data.Visualization[0];
    return x <= 1 ? x / (1 / MAX_MOVING_PIXELS) : x;
  }

  get posY() {
    const y = this.data.Visualization[1];
    return y < 1 ? y / (1 / MAX_MOVING_PIXELS) : y;
  }

  get width() {
    return this.minSize.w;
  }

  get height() {
    return Math.max(this.getHeight(), this.minSize.h);
  }

  get center() {
    const { posX, posY, width, height } = this;

    return {
      xCenter: posX + width / 2,
      yCenter: posY + height / 2
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
  getNrOfPorts = () => {
    const output = { In: 0, Out: 0 };

    this._ports.forEach(port => {
      output[port.type] += 1;
    });

    return {
      Max: Math.max(output.In, output.Out),
      ...output
    };
  };

  /**
   * @private
   * Calculate node height based on the max nr. of ports per type
   */
  getHeight = () => {
    const { portsSpacing } = this;
    const minPorts = 5;
    const minHeight = portsSpacing * minPorts;
    const height = (this.getNrOfPorts().Max + 1) * portsSpacing;

    return Math.max(minHeight, height);
  };

  /**
   * @private
   * @param {*} type
   * @returns
   */
  getPortsInitialPos = type => {
    const nrOfPorts = this.getNrOfPorts();
    const height = this.getHeight();
    const { width, portsSpacing } = this;
    const { x, y } = this.padding;

    const initX = {
      In: x / 2,
      Out: width + x / 2
    };

    const initY = height / 2 - ((nrOfPorts[type] - 1) * portsSpacing) / 2 + y;

    return [initX[type], initY];
  };

  getPortPos = portName => {
    return this._ports.get(portName)?.position;
  };
}
