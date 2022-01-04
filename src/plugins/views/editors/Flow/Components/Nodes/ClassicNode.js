import BaseNode from "./BaseNode/BaseNode";

class ClassicNode extends BaseNode {
  constructor(canvas, node, events, template) {
    super(canvas, node, events, "node", template);

    this._init();
  }

  static builder = async (canvas, node, events) => {
    const tpl = await ClassicNode.getNodeTemplate(node.Template);

    return new ClassicNode(canvas, node, events, tpl);
  };
}

export default ClassicNode;
