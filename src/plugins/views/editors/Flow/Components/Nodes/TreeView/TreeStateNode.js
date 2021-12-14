import TreeNode from "../BaseNode/TreeView/TreeNode";

class TreeStateNode extends TreeNode {
  constructor(canvas, node, events, template, parent) {
    super(canvas, node, events, "state", template, parent);

    this.data = {
      id: node.id,
      StateLabel: node.StateLabel || "",
      name: node.StateLabel || "",
      Parameter: node.Parameter || {},
      Template: node.Template || "",
      type: "State"
    };

    this._init();
  }

  //========================================================================================
  /*                                                                                      *
   *                                Getters & Setters                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * name - returns the container's label
   *
   * @returns {string} the container's label
   */
  get name() {
    return this.data.StateLabel;
  }

  //========================================================================================
  /*                                                                                      *
   *                                     Static                                           *
   *                                                                                      */
  //========================================================================================

  /**
   * Build TreeStateNode and returns corresponding instance
   *
   * @param {Canvas} canvas: Main canvas instance
   * @param {Object} node: Base node information
   * @param {TreeContainerNode} parent: Node Parent
   *
   * @returns {TreeStateNode} Created TreeStateNode instance
   */
  static builder = async (canvas, node, parent) => {
    const tpl = await TreeStateNode.getNodeTemplate(node.Template, "state");

    return new TreeStateNode(canvas, node, {}, tpl, parent);
  };
}

export default TreeStateNode;
