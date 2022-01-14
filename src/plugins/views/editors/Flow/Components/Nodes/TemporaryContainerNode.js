import ContainerNode from "./ContainerNode";

class TemporaryContainerNode extends ContainerNode {
  constructor(canvas, node, events, template) {
    super(canvas, node, events, template);
    this.postInit();
  }

  postInit = () => {
    this.object.attr("opacity", "0.5");
  };
}

export default TemporaryContainerNode;
