import Link from "./Link";

test("serialize OF db", () => {
  const id = "5f148e55-38d0-4bbf-a66a-da2c99dd56ae";
  const content = {
    [id]: {
      From: "test2/p2/out",
      To: "test/p1/in"
    }
  };

  const obj = Link.serializeOfDB(content);

  expect(obj.name).toBe(id);
  expect(obj.getFrom()).toBe(content[id].From);
  expect(obj.getTo()).toBe(content[id].To);
});

test("serialize", () => {
  const id = "5f148e55-38d0-4bbf-a66a-da2c99dd56ae";
  const content = {
    [id]: {
      From: "test2/p2/out",
      To: "test/p1/in"
    }
  };

  const obj = Link.serializeOfDB(content);

  const expected = { name: id, from: content[id].From, to: content[id].To };

  expect(obj.serialize()).toMatchObject(expected);
});

test("serialize TO db", () => {
  const id = "5f148e55-38d0-4bbf-a66a-da2c99dd56ae";
  const content = {
    [id]: {
      From: "test2/p2/out",
      To: "test/p1/in"
    }
  };

  const obj = Link.serializeOfDB(content);

  expect(obj.serializeToDB()).toMatchObject(content);
});
