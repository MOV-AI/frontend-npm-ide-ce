import NodeInstances from "./NodeManager";
import Node from "./Node";

test("get a node instance", () => {
  const obj = new NodeInstances();

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
  const nodes = new NodeInstances();
  const nodeName = "test";

  const content = {
    NodeLabel: nodeName,
    Template: "test",
    Visualization: { x: 5, y: 5 }
  };

  nodes.setNode({ name: nodeName, content });

  expect(nodes.getNode(nodeName)).toBeInstanceOf(Node);
  expect(nodes.getNode(nodeName).getName()).toBe(nodeName);
  expect(nodes.getNode(nodeName).getTemplate()).toBe(content.Template);
  expect(nodes.getNode(nodeName).getPosition()).toMatchObject(
    content.Visualization
  );
});

test("delete a node instance", () => {
  const nodes = new NodeInstances();
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
  const nodes = new NodeInstances();
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
