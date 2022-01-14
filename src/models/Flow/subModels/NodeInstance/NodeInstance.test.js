import Position from "./Position/Position";
import Manager from "../../../Manager";
import NodeInstance from "./NodeInstance";

test("Smoke test", () => {
  const obj = new NodeInstance();

  expect(obj).toBeInstanceOf(NodeInstance);
  expect(obj.getGroups()).toMatchObject([]);
  expect(obj.getPosition()).toBeInstanceOf(Position);
  expect(obj.getParameters()).toBeInstanceOf(Manager);
  expect(obj.getEnvVars()).toBeInstanceOf(Manager);
  expect(obj.getCommands()).toBeInstanceOf(Manager);
});

test("Serialize OF db", () => {
  const data = {
    align: {
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
    }
  };

  const expected = {
    name: "align",
    template: "align_cart",
    persistent: true,
    launch: true,
    remappable: true,
    groups: ["0"],
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

  expect(NodeInstance.serializeOfDB(data)).toMatchObject(expected);
});

test("Serialize TO db", () => {
  const data = {
    template: "align_cart",
    name: "align",
    persistent: true,
    launch: true,
    remappable: true,
    groups: ["0"],
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

  const obj = new NodeInstance();
  obj.setData(data);

  expect(obj.serializeToDB(data)).toMatchObject(expected);
});

test("Create node", () => {
  const content = {
    template: "align_cart",
    name: "align",
    persistent: true,
    launch: true,
    remappable: true,
    groups: ["0"],
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

  const obj = new NodeInstance();
  obj.setData(content);

  expect(obj.getName()).toBe(content.name);
  expect(obj.getTemplate()).toBe(content.template);
  expect(obj.getPosition()).toBeInstanceOf(Position);
});
