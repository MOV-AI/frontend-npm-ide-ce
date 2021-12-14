import Node from "./Node";

test("validate defaults", () => {
  const obj = new Node();

  expect(obj.getName()).toBe("");
  expect(obj.getTemplate()).toBe("");
  expect(obj.getPosition()).toMatchObject({ x: 0, y: 0 });
});

test("serialize OF DB", () => {
  const data = {
    NodeLabel: "test",
    Template: "test",
    Visualization: { x: 1, y: 1 }
  };

  const expected = {
    name: data.NodeLabel,
    template: data.Template,
    position: { ...data.Visualization }
  };

  expect(Node.serializeOfDB(data)).toMatchObject(expected);
});

test("serialize TO DB", () => {
  const obj = new Node();

  const data = {
    name: "test",
    template: "test",
    position: { x: 1, y: 1 }
  };

  obj.setData(data);

  const expected = {
    NodeLabel: data.name,
    Template: data.template,
    Visualization: { ...data.position }
  };

  expect(obj.serializeToDB(data)).toMatchObject(expected);
});
