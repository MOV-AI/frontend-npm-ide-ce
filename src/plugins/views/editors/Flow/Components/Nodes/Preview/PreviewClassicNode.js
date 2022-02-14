import PreviewNode from "../BaseNode/Preview/PreviewNode";

class PreviewClassicNode extends PreviewNode {
  constructor(canvas, node, events, template, parent) {
    super(canvas, node, events, "node", template, parent);

    this.init();
  }
}

export default PreviewClassicNode;
