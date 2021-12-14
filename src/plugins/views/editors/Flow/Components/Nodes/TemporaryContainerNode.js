import ContainerNode from "./ContainerNode";
import Flows from "../../Subscribers/Flows";

class TemporaryContainerNode extends ContainerNode {
  constructor(canvas, node, events, template) {
    super(canvas, node, events, template);
    this._postInit();
  }

  _postInit = () => {
    this.object.attr("opacity", "0.5");
  };

  static builder = async (canvas, node, events) => {
    const flows = new Flows();
    const tpl = await flows.getFlow(node.ContainerFlow);

    return new TemporaryContainerNode(canvas, node, events, tpl);
  };
}

export default TemporaryContainerNode;
