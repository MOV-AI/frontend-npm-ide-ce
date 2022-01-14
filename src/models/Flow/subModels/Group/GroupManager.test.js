import Manager from "./GroupManager";
import Group from "./Group";

test("smoke test", () => {
  const obj = new Manager("groups", Group);

  expect(obj).toBeInstanceOf(Manager);
});

test("serialize OF db", () => {
  const content = {
    0: {
      name: "layer1",
      on: true
    },
    1: {
      name: "layer2",
      on: true
    }
  };

  const expected = {
    0: {
      name: "layer1",
      enabled: content[0].on
    },
    1: {
      name: "layer2",
      enabled: content[1].on
    }
  };

  const data = Manager.serializeOfDB(content, Group);

  expect(data).toMatchObject(expected);
});

test("serialize TO db", () => {
  const content = {
    0: {
      name: "layer1",
      on: true
    },
    1: {
      name: "layer2",
      on: true
    }
  };

  const data = Manager.serializeOfDB(content, Group);

  const obj = new Manager("groups", Group);

  obj.setData(data);
  expect(obj.getItem("0")).toBeInstanceOf(Group);
  expect(obj.getItem("0").getEnabled()).toBe(true);

  expect(obj.serializeToDB()).toMatchObject(content);
});

test("get a group instance", () => {
  const obj = new Manager("groups", Group);

  const content = {
    name: "group1",
    on: true
  };

  obj.setItem({ name: "0", content });

  const subflow = obj.getItem("0");

  expect(subflow).toBeInstanceOf(Group);
});
