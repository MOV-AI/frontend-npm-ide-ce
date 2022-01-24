import BaseNode from "./BaseNode/BaseNode";

class TemporaryNode extends BaseNode {
  constructor({ canvas, node, template }) {
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

    this.init().postInit();
  }

  postInit = () => {
    this.object.attr("opacity", "0.5");
  };

  /**
   * @override
   */
  onClick = () => {
    // Empty on purpose
  };
}

export default TemporaryNode;
