export default class Node {
  constructor(name) {
    this.name = name;
    this.url = `global/${this.getScope()}/${this.name}`;
  }

  getScope() {
    return Node.SCOPE;
  }

  getFileExtension() {
    return ".nd";
  }

  static SCOPE = "Node";

  static ofJSON(json) {
    return new Node(json.Label);
  }
}
