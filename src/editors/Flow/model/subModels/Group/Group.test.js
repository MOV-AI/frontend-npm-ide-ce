import Group from "./Group";

test("Smoke test", () => {
  const obj = new Group();

  expect(obj).toBeInstanceOf(Group);
});

test("Serialize OF db", () => {
  const data = { 0: { name: "layer1", on: true } };

  const expected = {
    id: "0",
    name: "layer1",
    enabled: true
  };

  expect(Group.serializeOfDB(data)).toMatchObject(expected);
});

test("Serialize TO db", () => {
  const data = {
    id: "0",
    name: "layer1",
    enabled: true
  };

  const expected = { name: "layer1", on: true };

  const obj = new Group();
  obj.setData(data);

  expect(obj.serializeToDB()).toMatchObject(expected);
});
