export default class Configuration {
  constructor(name) {
    this.name = name;
    this.url = `global/${this.getType()}/${this.name}`;
  }

  getType() {
    return Configuration.TYPE;
  }

  static TYPE = "Configuration";

  static ofBEJSON(json) {
    return new Configuration(json.Label);
  }
}
