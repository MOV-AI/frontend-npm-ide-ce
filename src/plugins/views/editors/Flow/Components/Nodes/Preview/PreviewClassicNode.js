import PreviewNode from "../BaseNode/Preview/PreviewNode";

class PreviewClassicNode extends PreviewNode {
  constructor(canvas, node, events, template, parent) {
    super(canvas, node, events, "node", template, parent);

    this.init();
  }

  /**
   * Build PreviewClassicNode and returns corresponding instance
   *
   * @param {Canvas} canvas: Main canvas instance
   * @param {Object} node: Base node information
   * @param {TreeContainerNode} parent: Node Parent
   *
   * @returns {PreviewClassicNode} Created PreviewClassicNode instance
   */
  static builder = async (canvas, node, parent) => {
    const tpl = await PreviewClassicNode.getNodeTemplate(node.Template);

    return new PreviewClassicNode(canvas, node, {}, tpl, parent);
  };
}

export default PreviewClassicNode;
