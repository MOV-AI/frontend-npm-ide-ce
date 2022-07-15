import NodeInstance from "./NodeInstance";
import Manager from "../../../Manager";
import { DATA_TYPES } from "../../../../utils/Constants";

test("Smoke test", () => {
  const obj = new Manager("nodes", NodeInstance);

  expect(obj).toBeInstanceOf(Manager);
});

test("Serialize OF db", () => {
  const content = {
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
        camera: { Value: "back1", Type: DATA_TYPES.ANY },
        move_distance_to_car: { Value: "0.30", Type: DATA_TYPES.NUMBER }
      }
    }
  };

  const expected = {
    align: {
      template: content.align.Template,
      name: content.align.NodeLabel,
      persistent: content.align.Persistent,
      launch: content.align.Launch,
      remappable: content.align.Remappable,
      groups: content.align.NodeLayers,
      commands: { cmd1: { name: "cmd1", value: "exec.sh" } },
      envVars: { path: { name: "path", value: "/opt/movai" } },
      position: { x: 0.01, y: 0.02 },
      parameters: {
        camera: { name: "camera", value: "back1", type: DATA_TYPES.ANY },
        move_distance_to_car: {
          name: "move_distance_to_car",
          value: "0.30",
          type: DATA_TYPES.NUMBER
        }
      }
    }
  };

  const data = Manager.serializeOfDB(content, NodeInstance);

  expect(data).toMatchObject(expected);
});

test("Serialize TO db", () => {
  const content = {
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
        y: { Value: 0.01 },
        x: { Value: 0.023333333333333334 }
      },
      Parameter: {
        camera: { Value: "back1", Type: DATA_TYPES.ANY },
        move_distance_to_car: { Value: "0.30", Type: DATA_TYPES.NUMBER }
      }
    }
  };

  const data = Manager.serializeOfDB(content, NodeInstance);

  const obj = new Manager("nodes", NodeInstance);

  obj.setData(data);
  expect(obj.getItem("align")).toBeInstanceOf(NodeInstance);
  expect(obj.getItem("align").getTemplate()).toBe(content.align.Template);

  expect(obj.serializeToDB()).toMatchObject(content);
});

test("Get a node instance", () => {
  const obj = new Manager("nodes", NodeInstance);

  const content = {
    NodeLabel: "test",
    Template: "test",
    Visualization: { x: 9, y: 9 }
  };

  obj.setItem({ name: content.NodeLabel, content });

  const node = obj.getItem(content.NodeLabel);

  expect(node).toBeInstanceOf(NodeInstance);
});

test("Add a node instance", () => {
  const nodes = new Manager("nodes", NodeInstance);
  const nodeName = "test";

  const content = {
    name: nodeName,
    template: "test",
    position: { x: 5, y: 5 }
  };

  nodes.setItem({ name: nodeName, content });

  expect(nodes.getItem(nodeName)).toBeInstanceOf(NodeInstance);
  expect(nodes.getItem(nodeName).getName()).toBe(nodeName);
  expect(nodes.getItem(nodeName).getTemplate()).toBe(content.template);
  expect(nodes.getItem(nodeName).getPosition()).toMatchObject(content.position);
});

test("Delete a node instance", () => {
  const nodes = new Manager("nodes", NodeInstance);
  const nodeName = "test";

  const content = {
    NodeLabel: nodeName,
    Template: "test",
    Visualization: { x: 5, y: 5 }
  };

  nodes.setItem({ name: nodeName, content });
  nodes.deleteItem(nodeName);

  expect(nodes.checkExists(nodeName)).toBe(false);
});

test("Update a node instance", () => {
  const nodes = new Manager("nodes", NodeInstance);
  const nodeName = "test";

  const content = {
    NodeLabel: nodeName,
    Template: "test",
    Visualization: { x: 5, y: 5 }
  };

  const newPosition = { x: 99, y: 99 };

  nodes.setItem({ name: nodeName, content });

  nodes.updateItem({ name: nodeName, content: { position: newPosition } });

  expect(nodes.getItem(nodeName).getPosition()).toMatchObject(newPosition);
});
