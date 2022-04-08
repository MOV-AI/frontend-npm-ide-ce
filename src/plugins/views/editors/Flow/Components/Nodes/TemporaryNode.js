import { DEFAULT_FUNCTION } from "../../../../../../utils/Utils";
import BaseNode from "./BaseNode/BaseNode";

class TemporaryNode extends BaseNode {
  constructor({ canvas, node, template, opacity }) {
    const customNode = {
      id: "",
      NodeLabel: node.Template,
      Paramater: {},
      Visualization: {
        x: { Value: 50 },
        y: { Value: 50 }
      },
      ...node
    };
    super({ canvas, node: customNode, events: {}, template });

    this.init().postInit(opacity);
  }

  postInit = (opacity = "0.5") => {
    this.object.attr("opacity", opacity);
  };

  /**
   * @override
   */
  onClick = () => DEFAULT_FUNCTION("onClick");
}

export default TemporaryNode;
