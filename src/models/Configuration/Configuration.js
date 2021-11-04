export default class Configuration {
  constructor(name) {
    this.name = name;
  }

  static ofBEJSON(json) {
    return new Configuration(json.Label);
  }
}
