import NodeManager from "./NodeManager";
import Node from "./Node";

test("smoke test", () => {
  const obj = new NodeManager();

  expect(obj).toBeInstanceOf(NodeManager);
});

test("serialize OF db", () => {
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
        camera: { Value: "back1", Type: "any" },
        move_distance_to_car: { Value: "0.30", Type: "number" }
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
      layers: content.align.NodeLayers,
      commands: { cmd1: { name: "cmd1", value: "exec.sh" } },
      envVars: { path: { name: "path", value: "/opt/movai" } },
      position: { x: 0.01, y: 0.02 },
      parameters: {
        camera: { name: "camera", value: "back1", type: "any" },
        move_distance_to_car: {
          name: "move_distance_to_car",
          value: "0.30",
          type: "number"
        }
      }
    }
  };

  const data = NodeManager.serializeOfDB(content);

  expect(data).toMatchObject(expected);
});

test("serialize TO db", () => {
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
        camera: { Value: "back1", Type: "any" },
        move_distance_to_car: { Value: "0.30", Type: "number" }
      }
    }
  };

  const data = NodeManager.serializeOfDB(content);

  const obj = new NodeManager();

  obj.setData(data);
  expect(obj.getNode("align")).toBeInstanceOf(Node);
  expect(obj.getNode("align").getTemplate()).toBe(content.align.Template);

  expect(obj.serializeToDB()).toMatchObject(content);
});

test("get a node instance", () => {
  const obj = new NodeManager();

  const content = {
    NodeLabel: "test",
    Template: "test",
    Visualization: { x: 9, y: 9 }
  };

  obj.setNode({ name: content.NodeLabel, content });

  const node = obj.getNode(content.NodeLabel);

  expect(node).toBeInstanceOf(Node);
});

test("add a node instance", () => {
  const nodes = new NodeManager();
  const nodeName = "test";

  const content = {
    name: nodeName,
    template: "test",
    position: { x: 5, y: 5 }
  };

  nodes.setNode({ name: nodeName, content });

  expect(nodes.getNode(nodeName)).toBeInstanceOf(Node);
  expect(nodes.getNode(nodeName).getName()).toBe(nodeName);
  expect(nodes.getNode(nodeName).getTemplate()).toBe(content.template);
  expect(nodes.getNode(nodeName).getPosition()).toMatchObject(content.position);
});

test("delete a node instance", () => {
  const nodes = new NodeManager();
  const nodeName = "test";

  const content = {
    NodeLabel: nodeName,
    Template: "test",
    Visualization: { x: 5, y: 5 }
  };

  nodes.setNode({ name: nodeName, content });
  nodes.deleteNode(nodeName);

  expect(nodes.checkExists(nodeName)).toBe(false);
});

test("update a node instance", () => {
  const nodes = new NodeManager();
  const nodeName = "test";

  const content = {
    NodeLabel: nodeName,
    Template: "test",
    Visualization: { x: 5, y: 5 }
  };

  const newPosition = { x: 99, y: 99 };

  nodes.setNode({ name: nodeName, content });

  nodes.updateNode({ name: nodeName, content: { position: newPosition } });

  expect(nodes.getNode(nodeName).getPosition()).toMatchObject(newPosition);
});
