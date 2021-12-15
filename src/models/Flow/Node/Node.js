import Model from "../../Model/Model";
import schema from "./schema";
import Position from "./Position/Position";
import ParameterManager from "../Parameter/ParameterManager";
import EnvVarManager from "./EnvVar/EnvVarManager";
import CommandManager from "./Command/CommandManager";

class Node extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Model properties
  name = "";
  template = "";
  persistent = false;
  launch = true;
  remappable = true;
  layers = [];
  position = new Position();
  parameters = new ParameterManager();
  envVars = new EnvVarManager();
  commands = new CommandManager();

  observables = [
    "name",
    "template",
    "persistent",
    "remappable",
    "layers",
    "position"
  ];

  getName() {
    return this.name;
  }

  setName(value) {
    this.name = value;
    return this;
  }

  getTemplate() {
    return this.template;
  }

  setTemplate(value) {
    this.template = value;
    return this;
  }

  getPersistent() {
    return this.persistent;
  }

  setPersistent(value) {
    this.persistent = value;
    return this;
  }

  getLaunch() {
    return this.launch;
  }

  setLaunch(value) {
    this.launch = value;
    return this;
  }

  getRemappable() {
    return this.remappable;
  }

  setRemappable(value) {
    this.remappable = value;
    return this;
  }

  getLayers() {
    return this.layers;
  }

  setLayers(value) {
    this.layers = value;
    return this;
  }

  getPosition() {
    return this.position;
  }

  getParameters() {
    return this.parameters;
  }

  getEnvVars() {
    return this.envVars;
  }

  getCommands() {
    return this.commands;
  }

  setData(json) {
    const {
      name,
      template,
      persistent,
      launch,
      remappable,
      layers,
      position,
      parameters,
      envVars,
      commands
    } = json;

    super.setData({
      name,
      template,
      persistent,
      launch,
      remappable,
      layers
    });

    this.position.setData(position);
    this.parameters.setData(parameters);
    this.envVars.setData(envVars);
    this.commands.setData(commands);

    return this;
  }

  serialize() {
    return {
      name: this.getName(),
      template: this.getTemplate(),
      persistent: this.getPersistent(),
      launch: this.getLaunch(),
      remappable: this.getRemappable(),
      layers: this.getLayers(),
      position: this.getPosition().serialize(),
      parameters: this.getParameters().serialize(),
      envvars: this.getEnvVars().serialize(),
      commands: this.getCommands().serialize()
    };
  }

  serializeToDB() {
    const { name, template, persistent, launch, remappable, layers } =
      this.serialize();

    return {
      NodeLabel: name,
      Template: template,
      Persistent: persistent,
      Launch: launch,
      Remappable: remappable,
      NodeLayers: layers,
      Visualization: {
        ...this.getPosition().serializeToDB()
      },
      Parameter: this.getParameters().serializeToDB(),
      EnvVar: this.getEnvVars().serializeToDB(),
      CmdLine: this.getCommands().serializeToDB()
    };
  }

  static serializeOfDB(json) {
    const {
      NodeLabel: name,
      Template: template,
      Persistent: persistent,
      Launch: launch,
      Remappable: remappable,
      NodeLayers: layers,
      Visualization: position,
      Parameter: parameters,
      EnvVar: envvars,
      CmdLine: commands
    } = json;

    return {
      name,
      template,
      persistent,
      launch,
      remappable,
      layers,
      position: Position.serializeOfDB(position),
      parameters: ParameterManager.serializeOfDB(parameters),
      envVars: EnvVarManager.serializeOfDB(envvars),
      commands: CommandManager.serializeOfDB(commands)
    };
  }
}

export default Node;
