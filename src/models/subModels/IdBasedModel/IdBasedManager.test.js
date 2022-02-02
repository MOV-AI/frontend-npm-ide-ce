import Manager from "./IdBasedManager";
import IdBased from "./IdBasedModel";

test("smoke test", () => {
  const obj = new Manager("model", IdBased);

  expect(obj).toBeInstanceOf(Manager);
});

test("serialize OF db", () => {
  const content = {
    0: {
      name: "layer1"
    },
    1: {
      name: "layer2"
    }
  };

  const expected = {
    0: {
      name: "layer1",
    },
    1: {
      name: "layer2",
    }
  };

  const data = Manager.serializeOfDB(content, IdBased);

  expect(data).toMatchObject(expected);
});

test("serialize TO db", () => {
  const content = {
    0: {
      name: "layer1"
    },
    1: {
      name: "layer2"
    }
  };

  const data = Manager.serializeOfDB(content, IdBased);

  const obj = new Manager("model", IdBased);

  obj.setData(data);
  expect(obj.getItem("0")).toBeInstanceOf(IdBased);

  expect(obj.serializeToDB()).toMatchObject(content);
});

test("get a IdBased instance", () => {
  const obj = new Manager("model", IdBased);

  const content = {
    name: "group1"
  };

  obj.setItem({ name: "0", content });

  const subflow = obj.getItem("0");

  expect(subflow).toBeInstanceOf(IdBased);
});
