import BaseNode from "./BaseNode/BaseNode";
import { convert_visualization } from "./Utils";

class StateNode extends BaseNode {
  constructor(canvas, node, events, template) {
    super(canvas, node, events, "state", template);

    this.data = {
      id: node.id,
      StateLabel: node.StateLabel || "",
      name: node.StateLabel || "",
      Parameter: node.Parameter || {},
      Template: node.Template || "",
      Visualization: convert_visualization(node.Visualization) || [50, 50],
      type: "State"
    };

    this._init();
  }

  get name() {
    return this.data.StateLabel;
  }

  static builder = async (canvas, node, events) => {
    const tpl = await StateNode.getNodeTemplate(node.Template, "state");

    return new StateNode(canvas, node, events, tpl);
  };
}

export default StateNode;
