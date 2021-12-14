import BaseNode from "./BaseNode/BaseNode";

class StartNode extends BaseNode {
  constructor(canvas, node, events) {
    const _node = {
      id: "start",
      NodeLabel: "start",
      Paramater: {},
      Template: "start",
      Visualization: {
        x: { Value: 20 },
        y: { Value: 20 }
      }
    };
    super(canvas, _node, {});

    this._init();
  }

  _init = () => {
    this._loadTemplate()
      ._addPorts()
      ._renderBody()
      ._renderHeader()
      ._renderPorts();
  };

  /**
   * disable all port events except the onClick
   */
  _portEvents = () => {
    return {
      onClick: port => this.onPortClick(port),
      onMouseOver: () => {},
      onMouseOut: () => {},
      onContext: () => {}
    };
  };

  _loadTemplate = () => {
    this._template = {
      id: "start",
      name: "start",
      template: {
        PortsInst: {
          start: {
            Out: {
              start: {
                Message: "movai_msgs/Transition"
              }
            },
            Template: "MovAI/TransitionFor",
            Package: "movai_msgs"
          }
        }
      }
    };
    return this;
  };

  get headerPos() {
    return {
      x: this.width / 2 + this.padding.x / 2,
      y: this.height + 15
    };
  }
}

export default StartNode;
