import Model from "../Model/Model";

export default class Configuration extends Model {
  constructor(name) {
    this.name = name;
    this.url = `global/${this.getType()}/${this.name}`;
  }

  getType() {
    return Configuration.TYPE;
  }

  static TYPE = "Configuration";

  static ofJSON(json) {
    debugger;
    return new Configuration(json.Label);
  }
}
