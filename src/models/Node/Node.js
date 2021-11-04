export default class Node {
  constructor(name) {
    this.name = name;
  }

  static ofBEJSON(json) {
    return new Node(json.Label);
  }
}
