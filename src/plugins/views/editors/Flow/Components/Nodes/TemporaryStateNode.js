import StateNode from "./StateNode";

class TemporaryStateNode extends StateNode {
  constructor(canvas, node, events) {
    super(canvas, node, events);
    this._postInit();
  }

  _postInit = () => {
    this.object.attr("opacity", "0.5");
  };
}

export default TemporaryStateNode;
