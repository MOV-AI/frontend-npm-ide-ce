export default class Node {
  constructor(name) {
    this.name = name;
    this.url = `global/${this.getType()}/${this.name}`;
  }

  getType() {
    return Node.TYPE;
  }

  static TYPE = "Node";

  static ofBEJSON(json) {
    return new Node(json.Label);
  }
}
