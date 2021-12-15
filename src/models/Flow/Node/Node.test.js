import Position from "./Position/Position";
import ParameterManager from "../Parameter/ParameterManager";
import EnvVarsManager from "./EnvVar/EnvVarManager";
import CommandsManager from "./Command/CommandManager";
import Node from "./Node";

test("smoke test", () => {
  const obj = new Node();

  expect(obj).toBeInstanceOf(Node);
  expect(obj.getName()).toBe("");
  expect(obj.getTemplate()).toBe("");
  expect(obj.getPersistent()).toBe(false);
  expect(obj.getLaunch()).toBe(true);
  expect(obj.getRemappable()).toBe(true);
  expect(obj.getLayers()).toMatchObject([]);
  expect(obj.getPosition()).toBeInstanceOf(Position);
  expect(obj.getParameters()).toBeInstanceOf(ParameterManager);
  expect(obj.getEnvVars()).toBeInstanceOf(EnvVarsManager);
  expect(obj.getCommands()).toBeInstanceOf(CommandsManager);
});

test("serialize OF db", () => {
  const data = {
    Template: "align_cart",
    NodeLabel: "align",
    Persistent: true,
    Launch: true,
    Remappable: true,
    NodeLayers: ["0"],
    CmdLine: { cmd1: { Value: "exec.sh" } },
    EnvVar: { path: { Value: "/opt/movai" } },
    Visualization: {
      x: { Value: 0.01 },
      y: { Value: 0.02 }
    },
    Parameter: {
      camera: { Value: "back1", Type: "string" },
      move_distance_to_car: { Value: "0.30", Type: "number" }
    }
  };

  const expected = {
    name: data.NodeLabel,
    template: data.Template,
    persistent: data.Persistent,
    launch: data.Launch,
    remappable: data.Remappable,
    layers: data.NodeLayers,
    position: { x: 0.01, y: 0.02 },
    parameters: {
      camera: { name: "camera", value: "back1", type: "string" },
      move_distance_to_car: {
        name: "move_distance_to_car",
        value: "0.30",
        type: "number"
      }
    },
    envVars: { path: { name: "path", value: "/opt/movai" } },
    commands: { cmd1: { name: "cmd1", value: "exec.sh" } }
  };

  expect(Node.serializeOfDB(data)).toMatchObject(expected);
});

test("serialize TO db", () => {
  const obj = new Node();

  const data = {
    template: "align_cart",
    name: "align",
    persistent: true,
    launch: true,
    remappable: true,
    layers: ["0"],
    commands: { cmd1: { name: "cmd1", value: "exec.sh" } },
    envVars: { path: { name: "path", value: "/opt/movai" } },
    position: { x: 0.01, y: 0.03 },
    parameters: {
      camera: { name: "camera", value: "back1", type: "any" },
      move_distance_to_car: {
        name: "move_distance_to_car",
        value: "0.30",
        type: "number"
      }
    }
  };

  obj.setData(data);

  const expected = {
    Template: "align_cart",
    NodeLabel: "align",
    Persistent: true,
    Launch: true,
    Remappable: true,
    NodeLayers: ["0"],
    CmdLine: { cmd1: { Value: "exec.sh" } },
    EnvVar: { path: { Value: "/opt/movai" } },
    Visualization: {
      x: { Value: 0.01 },
      y: { Value: 0.03 }
    },
    Parameter: {
      camera: { Value: "back1", Type: "any" },
      move_distance_to_car: { Value: "0.30", Type: "number" }
    }
  };

  expect(obj.serializeToDB(data)).toMatchObject(expected);
});

test("create node", () => {
  const content = {
    template: "align_cart",
    name: "align",
    persistent: true,
    launch: true,
    remappable: true,
    layers: ["0"],
    commands: { cmd1: { name: "cmd1", value: "exec.sh" } },
    envVars: { path: { name: "path", value: "/opt/movai" } },
    position: { x: 0.01, y: 0.03 },
    parameters: {
      camera: { name: "camera", value: "back1", type: "any" },
      move_distance_to_car: {
        name: "move_distance_to_car",
        value: "0.30",
        type: "number"
      }
    }
  };

  const obj = new Node();
  obj.setData(content);

  expect(obj.getName()).toBe(content.name);
  expect(obj.getTemplate()).toBe(content.template);
  expect(obj.getPosition()).toBeInstanceOf(Position);
});
