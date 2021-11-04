export default class Callback {
  constructor(name) {
    this.name = name;
  }

  static ofBEJSON(json) {
    return new Callback(json.Label);
  }
}
