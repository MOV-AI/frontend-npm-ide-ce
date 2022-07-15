import TreeNode from "../BaseNode/TreeView/TreeNode";

class TreeClassicNode extends TreeNode {
  constructor({ canvas, node, events, template, parent }) {
    super({ canvas, node, events, _type: "node", template, parent });

    this.init();
  }
}

export default TreeClassicNode;
