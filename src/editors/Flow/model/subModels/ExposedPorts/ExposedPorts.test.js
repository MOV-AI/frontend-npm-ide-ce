import ExposedPorts from "./ExposedPorts";

test("smoke test", () => {
  const obj = new ExposedPorts();

  expect(obj).toBeInstanceOf(ExposedPorts);
});

test("serialize OF db", () => {
  const data = {
    aa: {
      teste: ["p1/in"]
    }
  };

  const expected = { name: "teste", ports: ["p1/in"] };

  expect(ExposedPorts.serializeOfDB(data)).toMatchObject(expected);
});

test("serialize TO db", () => {
  const data = { name: "teste", ports: ["p1/in"] };

  const obj = new ExposedPorts();
  obj.setData(data);

  const expected = { teste: ["p1/in"] };

  expect(obj.serializeToDB(data)).toMatchObject(expected);
});
