import Position from "./Position";

test("smoke test", () => {
  const obj = new Position();

  expect(obj).toBeInstanceOf(Position);
  expect(obj.getX()).toBe(0);
  expect(obj.getY()).toBe(0);
});

test("serialize OF db", () => {
  const content = {
    y: { Value: 0.01 },
    x: { Value: 0.03 }
  };

  const data = Position.serializeOfDB(content);

  const expected = {
    y: 0.01,
    x: 0.03
  };

  expect(data).toMatchObject(expected);
});

test("serialize TO db", () => {
  const content = {
    x: 1,
    y: 2
  };

  const expected = {
    x: { Value: 1 },
    y: { Value: 2 }
  };

  const obj = new Position();

  obj.setData(content);

  expect(obj.serializeToDB()).toMatchObject(expected);
});
