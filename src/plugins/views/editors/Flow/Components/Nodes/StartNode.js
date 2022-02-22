import BaseNode from "./BaseNode/BaseNode";

class StartNode extends BaseNode {
  constructor(args) {
    const node = {
      id: "start",
      NodeLabel: "start",
      Paramater: {},
      Template: "start",
      Visualization: {
        x: { Value: 20 },
        y: { Value: 20 }
      }
    };
    const template = {
      Label: "start",
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
    };

    super({ ...args, node, template });

    this.init();
  }

  init = () => {
    this.addPorts().renderBody().renderHeader().renderPorts();
  };

  /**
   * @override Override onSelected from BaseNode
   */
  onSelected = () => {
    // Emtpy on purpose
  };

  /**
   * disable all port events except the onClick
   */
  portEvents = () => {
    return {
      onClick: port => this.onPortClick(port),
      onMouseOver: () => {
        // Empty
      },
      onMouseOut: () => {
        // Empty
      },
      onContext: () => {
        // Empty
      }
    };
  };

  get headerPos() {
    return {
      x: this.width / 2 + this.padding.x / 2,
      y: this.height + 15
    };
  }
}

export default StartNode;
