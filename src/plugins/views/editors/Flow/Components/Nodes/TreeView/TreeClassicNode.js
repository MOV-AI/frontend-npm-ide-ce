import TreeNode from "../BaseNode/TreeView/TreeNode";

class TreeClassicNode extends TreeNode {
  constructor(canvas, node, events, template, parent) {
    super(canvas, node, events, "node", template, parent);

    this.init();
  }

  /**
   * Build TreeClassicNode and returns corresponding instance
   *
   * @param {Canvas} canvas: Main canvas instance
   * @param {Object} node: Base node information
   * @param {TreeContainerNode} parent: Node Parent
   *
   * @returns {TreeClassicNode} Created TreeClassicNode instance
   */
  static builder = async (canvas, node, parent) => {
    const tpl = await TreeClassicNode.getNodeTemplate(node.Template);

    return new TreeClassicNode(canvas, node, {}, tpl, parent);
  };
}

export default TreeClassicNode;
