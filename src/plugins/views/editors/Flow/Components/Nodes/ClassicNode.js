import BaseNode from "./BaseNode/BaseNode";

class ClassicNode extends BaseNode {
  constructor(args) {
    super({ ...args, type: "node" });

    this.init();
  }
}

export default ClassicNode;
