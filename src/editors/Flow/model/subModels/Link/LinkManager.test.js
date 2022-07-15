import Link from "./Link";
import Manager from "../../../Manager";

test("Smoke test", () => {
  const obj = new Manager("links", Link);

  expect(obj).toBeInstanceOf(Manager);
});

test("Serialize OF db", () => {
  const id1 = "5f148e55-38d0-4bbf-a66a-da2c99dd56ae";
  const id2 = "90828e55-3340-4bbf-a66a-dadhuewd56ae";
  const content = {
    [id1]: {
      From: "test2/p2/out",
      To: "test/p1/in"
    },
    [id2]: {
      From: "test1/p1/out",
      To: "test2/p2/in"
    }
  };

  const expected = {
    [id1]: {
      from: content[id1].From,
      to: content[id1].To
    },
    [id2]: {
      from: content[id2].From,
      to: content[id2].To
    }
  };

  const data = Manager.serializeOfDB(content, Link);

  expect(data).toMatchObject(expected);
});

test("Get a link instance", () => {
  const obj = new Manager("links", Link);

  const id = "5f148e55-38d0-4bbf-a66a-da2c99dd56ae";
  const content = {
    [id]: {
      From: "test2/p2/out",
      To: "test/p1/in"
    }
  };

  obj.setItem({ name: id, content });

  const link = obj.getItem(id);

  expect(link).toBeInstanceOf(Link);
});
