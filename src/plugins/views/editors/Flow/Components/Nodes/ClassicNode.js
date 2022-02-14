import BaseNode from "./BaseNode/BaseNode";

class ClassicNode extends BaseNode {
  constructor(args) {
    super({ ...args });

    this.init();
  }
}

export default ClassicNode;
