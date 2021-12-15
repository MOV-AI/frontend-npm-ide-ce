import Position from "./Position";

test("smoke test", () => {
  const obj = new Position();

  expect(obj).toBeInstanceOf(Position);
  expect(obj.getX()).toBe(0);
  expect(obj.getY()).toBe(0);
});

test("serialize OF db", () => {
  const content = [0.01, 0.03];

  const data = Position.serializeOfDB(content);

  const expected = {
    x: 0.01,
    y: 0.03
  };

  expect(data).toMatchObject(expected);
});

test("serialize TO db", () => {
  const content = {
    x: 1,
    y: 2
  };

  const expected = [1, 2];

  const obj = new Position();

  obj.setData(content);

  expect(obj.serializeToDB()).toMatchObject(expected);
});
