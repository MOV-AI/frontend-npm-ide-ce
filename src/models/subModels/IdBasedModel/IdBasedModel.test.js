import IdBased from "./IdBasedModel";

test("Smoke test", () => {
  const obj = new IdBased();

  expect(obj).toBeInstanceOf(IdBased);
});

test("Serialize OF db", () => {
  const data = { 0: { name: "layer1"} };

  const expected = {
    id: "0",
    name: "layer1",
  };

  expect(IdBased.serializeOfDB(data)).toMatchObject(expected);
});

test("Serialize TO db", () => {
  const data = {
    id: "0",
    name: "layer1",
  };

  const expected = { name: "layer1" };

  const obj = new IdBased();
  obj.setData(data);

  expect(obj.serializeToDB()).toMatchObject(expected);
});
