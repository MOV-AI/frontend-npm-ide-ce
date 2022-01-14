import Model from "../../../Model";
import schema from "./schema";
import Position from "./Position/Position";
import { Command, EnvVar, Parameter } from "../../../subModels";
import Manager from "../../../Manager";

class NodeInstance extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  propEvents = {
    onAny: (event, name, value) => this.propsUpdate(event, name, value)
  };

  // Model properties
  template = "";
  persistent = false;
  launch = true;
  remappable = true;
  groups = [];
  position = new Position();
  parameters = new Manager("parameters", Parameter, this.propEvents);
  envVars = new Manager("envVars", EnvVar, this.propEvents);
  commands = new Manager("commands", Command, this.propEvents);

  // Define observable properties
  observables = Object.values(NodeInstance.OBSERVABLE_KEYS);

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

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

  getGroups() {
    return this.groups;
  }

  setGroups(value) {
    this.groups = value;
    return this;
  }

  getPosition() {
    return this.position;
  }

  setPosition(x, y) {
    this.position.setData({ x, y });
    this.dispatch(
      NodeInstance.OBSERVABLE_KEYS.POSITION,
      this.position.serialize()
    );

    return this;
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
      groups,
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
      groups
    });

    this.position.setData(position);
    this.parameters.setData(parameters);
    this.envVars.setData(envVars);
    this.commands.setData(commands);

    return this;
  }

  //========================================================================================
  /*                                                                                      *
   *                                        Events                                        *
   *                                                                                      */
  //========================================================================================

  propsUpdate(event, prop, value) {
    // force dispatch
    this.dispatch(prop, value);
  }

  //========================================================================================
  /*                                                                                      *
   *                                      Serializers                                     *
   *                                                                                      */
  //========================================================================================

  serialize() {
    return {
      name: this.getName(),
      template: this.getTemplate(),
      persistent: this.getPersistent(),
      launch: this.getLaunch(),
      remappable: this.getRemappable(),
      groups: this.getGroups(),
      position: this.getPosition().serialize(),
      parameters: this.getParameters().serialize(),
      envvars: this.getEnvVars().serialize(),
      commands: this.getCommands().serialize()
    };
  }

  serializeToDB() {
    const { name, template, persistent, launch, remappable, groups } =
      this.serialize();

    return {
      NodeLabel: name,
      Template: template,
      Persistent: persistent,
      Launch: launch,
      Remappable: remappable,
      NodeLayers: groups,
      Visualization: {
        ...this.getPosition().serializeToDB()
      },
      Parameter: this.getParameters().serializeToDB(),
      EnvVar: this.getEnvVars().serializeToDB(),
      CmdLine: this.getCommands().serializeToDB()
    };
  }

  static serializeOfDB(json) {
    const name = Object.keys(json)[0];
    const content = Object.values(json)[0];

    const {
      Template: template,
      Persistent: persistent,
      Launch: launch,
      Remappable: remappable,
      NodeLayers: groups,
      Visualization: position,
      Parameter: parameters,
      EnvVar: envvars,
      CmdLine: commands
    } = content;

    return {
      name,
      template,
      persistent,
      launch,
      remappable,
      groups,
      position: Position.serializeOfDB(position),
      parameters: Manager.serializeOfDB(parameters, Parameter),
      envVars: Manager.serializeOfDB(envvars, EnvVar),
      commands: Manager.serializeOfDB(commands, Command)
    };
  }

  static OBSERVABLE_KEYS = {
    NAME: "name",
    TEMPLATE: "template",
    PERSISTENT: "persistent",
    REMAPPABLE: "remappable",
    GROUPS: "groups",
    POSITION: "persistent"
  };
}

export default NodeInstance;
