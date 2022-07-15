import PreviewNode from "../BaseNode/Preview/PreviewNode";
import { getBaseTemplate } from "../Utils";

class PreviewContainerNode extends PreviewNode {
  constructor(canvas, node, events, template, parent) {
    const type = "container";
    const containerTemplate = template || getBaseTemplate(type);
    super(canvas, node, events, type, containerTemplate, parent);

    this.init();
  }
}

export default PreviewContainerNode;
