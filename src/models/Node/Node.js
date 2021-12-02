import Model from "../Model/Model";

export default class Node extends Model {
  getScope() {
    return Node.SCOPE;
  }

  static SCOPE = "Node";

  static ofJSON(json) {
    const { Label: name, LastUpdate: details } = json;
    return new Node(name, details);
  }

  static EMPTY = new Node();
}
