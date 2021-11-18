export default class Configuration {
  constructor(name) {
    this.name = name;
    this.data = {
      Label: name,
      LastUpdate: { user: "", date: "" },
      Type: "",
      Yaml: ""
    };
    this.url = `global/${this.getScope()}/${this.name}`;
  }

  getScope() {
    return Configuration.TYPE;
  }

  getDetails() {
    return this.data.LastUpdate;
  }

  getCode() {
    return this.data.Yaml;
  }

  getType() {
    return this.data.Type;
  }

  setType(type) {
    this.data.Type = type;
    return this;
  }

  setCode(code) {
    this.data.Yaml = code;
    return this;
  }

  mock() {
    this.data.Yaml = `${this.name} : yaml code`;
    this.data.Type = "yaml";
    this.data.LastUpdate.user = "movai";
    this.data.LastUpdate.date = new Date().toLocaleString();
  }

  static TYPE = "Configuration";

  static ofBEJSON(json) {
    return new Configuration(json.Label);
  }
}
