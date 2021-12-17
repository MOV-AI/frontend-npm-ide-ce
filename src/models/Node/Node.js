import Model from "../Model/Model";
import schema from "./schema";
import { Command, EnvVar, Parameter, Port } from "../subModels";
import Manager from "../Manager";

class Node extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });
  }

  // Model properties
  description = "";
  path = "";
  type = "";
  persistent = false;
  launch = true;
  remappable = true;
  packageDep = "";
  events = {
    onAny: (event, name, value) => this.propsUpdate(event, name, value)
  };
  parameters = new Manager("parameters", Parameter, this.events);
  envVars = new Manager("envVars", EnvVar, this.events);
  commands = new Manager("commands", Command, this.events);

  ports = new Manager("ports", Port, this.events);

  observables = [
    "name",
    "details",
    "description",
    "path",
    "type",
    "persistent",
    "launch",
    "remappable",
    "packageDep"
  ];

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  getDescription() {
    return this.description;
  }

  setDescription(value) {
    this.description = value;
    return this;
  }

  getPath() {
    return this.path;
  }

  setPath(value) {
    this.path = value;
    return this;
  }

  getType() {
    return this.type;
  }

  setType(value) {
    this.type = value;
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

  getPackageDep() {
    return this.packageDep;
  }

  setPackageDep(value) {
    this.packageDep = value;
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

  getPorts() {
    return this.ports;
  }

  getScope() {
    return Node.SCOPE;
  }

  getFileExtension() {
    return Node.EXTENSION;
  }

  setData(json) {
    const {
      name,
      details,
      description,
      path,
      type,
      persistent,
      packageDep,
      launch,
      remappable,
      parameters,
      envVars,
      commands,
      ports
    } = json;

    super.setData({
      name,
      details,
      description,
      path,
      type,
      persistent,
      packageDep,
      launch,
      remappable
    });

    this.parameters.setData(parameters);
    this.envVars.setData(envVars);
    this.commands.setData(commands);
    this.ports.setData(ports);

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
      ...super.serialize(),
      name: this.getName(),
      details: this.getDetails(),
      description: this.getDescription(),
      path: this.getPath(),
      type: this.getType(),
      persistent: this.getPersistent(),
      packageDep: this.getPackageDep(),
      launch: this.getLaunch(),
      remappable: this.getRemappable(),
      parameters: this.getParameters().serialize(),
      envvars: this.getEnvVars().serialize(),
      commands: this.getCommands().serialize(),
      ports: this.getPorts().serialize()
    };
  }

  serializeToDB() {
    const {
      name,
      details,
      description,
      path,
      type,
      persistent,
      packageDep,
      launch,
      remappable
    } = this.serialize();

    return {
      Label: name,
      Info: description,
      Path: path,
      Type: type,
      Persistent: persistent,
      Launch: launch,
      Remappable: remappable,
      LastUpdate: details,
      PackageDepends: packageDep,
      Parameter: this.getParameters().serializeToDB(),
      EnvVar: this.getEnvVars().serializeToDB(),
      CmdLine: this.getCommands().serializeToDB(),
      PortsInst: this.getPorts().serializeToDB()
    };
  }

  static serializeOfDB(json) {
    const {
      Label: id,
      Label: name,
      LastUpdate: details,
      workspace,
      version,
      Info: description,
      Path: path,
      Type: type,
      Persistent: persistent,
      Launch: launch,
      Remappable: remappable,
      PackageDepends: packageDep,
      Parameter: parameters,
      EnvVar: envVars,
      CmdLine: commands,
      PortsInst: ports
    } = json;

    return {
      id,
      name,
      details,
      workspace,
      version,
      description,
      path,
      type,
      persistent,
      launch,
      remappable,
      packageDep,
      parameters: Manager.serializeOfDB(parameters, Parameter),
      envVars: Manager.serializeOfDB(envVars, EnvVar),
      commands: Manager.serializeOfDB(commands, Command),
      ports: Manager.serializeOfDB(ports, Port)
    };
  }
  static SCOPE = "Node";

  static EXTENSION = ".nd";
}

Node.defaults = {
  description: "",
  path: "",
  type: "",
  persistent: false,
  launch: true,
  remappable: true,
  packageDep: ""
};

export default Node;
