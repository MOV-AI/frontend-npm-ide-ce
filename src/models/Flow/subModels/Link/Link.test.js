import Link from "./Link";

test("Smoke test", () => {
  const obj = new Link();

  expect(obj).toBeInstanceOf(Link);
  expect(obj.getName()).toBe("");
  expect(obj.getFrom()).toBe("");
  expect(obj.getTo()).toBe("");
});

test("Serialize OF db", () => {
  const id = "5f148e55-38d0-4bbf-a66a-da2c99dd56ae";
  const content = {
    [id]: {
      From: "test2/p2/out",
      To: "test/p1/in"
    }
  };

  const expected = {
    name: id,
    from: "test2/p2/out",
    to: "test/p1/in"
  };

  expect(Link.serializeOfDB(content)).toMatchObject(expected);
});

test("Serialize TO db", () => {
  const data = {
    name: "5f148e55-38d0-4bbf-a66a-da2c99dd56ae",
    from: "test2/p2/out",
    to: "test/p1/in"
  };

  const obj = new Link();
  obj.setData(data);

  const expected = {
    From: data.from,
    To: data.to
  };

  expect(obj.serializeToDB()).toMatchObject(expected);
});

test("serialize", () => {
  const id = "5f148e55-38d0-4bbf-a66a-da2c99dd56ae";
  const content = {
    [id]: {
      From: "test2/p2/out",
      To: "test/p1/in"
    }
  };
  const obj = new Link();
  obj.setData(Link.serializeOfDB(content));

  const expected = { name: id, from: content[id].From, to: content[id].To };

  expect(obj.serialize()).toMatchObject(expected);
});
