import { TYPES } from "../../../Constants/constants";
import PreviewNode from "../BaseNode/Preview/PreviewNode";
import { getBaseTemplate } from "../Utils";

class PreviewContainerNode extends PreviewNode {
  constructor(canvas, node, events, template, parent) {
    const containerTemplate = template || getBaseTemplate(TYPES.CONTAINER);
    super(canvas, node, events, TYPES.CONTAINER, containerTemplate, parent);

    this.init();
  }
}

export default PreviewContainerNode;
