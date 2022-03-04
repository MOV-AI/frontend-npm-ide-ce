import BaseNode from "./BaseNode/BaseNode";

const START_NAME = "start";

class StartNode extends BaseNode {
  constructor(args) {
    const node = {
      id: START_NAME,
      NodeLabel: START_NAME,
      Paramater: {},
      Template: START_NAME,
      Visualization: {
        x: { Value: 20 },
        y: { Value: 20 }
      }
    };
    const template = {
      Label: START_NAME,
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

    // Set start node model
    this.data.model = START_NAME;

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

  static model = "start"
}

export default StartNode;
