export default class Flow {
  constructor(name) {
    this.name = name;
  }

  static ofBEJSON(json) {
    return new Flow(json.Label);
  }
}
