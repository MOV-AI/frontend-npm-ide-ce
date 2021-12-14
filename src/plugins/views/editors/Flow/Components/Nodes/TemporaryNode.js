import BaseNode from "./BaseNode/BaseNode";

class TemporaryNode extends BaseNode {
  constructor(canvas, node, template) {
    const _node = {
      id: "",
      NodeLabel: node.Template,
      Paramater: {},
      Visualization: {
        x: { Value: 50 },
        y: { Value: 50 }
      },
      ...node
    };
    super(canvas, _node, {}, "node", template);

    this._init()._postInit();
  }

  _postInit = () => {
    this.object.attr("opacity", "0.5");
  };

  _onClick = () => {};

  static builder = async (canvas, node, events) => {
    const tpl = await TemporaryNode.getNodeTemplate(node.Template);

    return new TemporaryNode(canvas, node, tpl);
  };
}

export default TemporaryNode;
