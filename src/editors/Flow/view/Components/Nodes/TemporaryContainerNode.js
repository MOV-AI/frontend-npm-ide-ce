import ContainerNode from "./ContainerNode";

class TemporaryContainerNode extends ContainerNode {
  postInit = () => {
    this.object.attr("opacity", "0.5");
  };
}

export default TemporaryContainerNode;
