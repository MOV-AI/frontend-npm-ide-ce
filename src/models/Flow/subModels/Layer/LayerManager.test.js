import Manager from "./LayerManager";
import Layer from "./Layer";

test("smoke test", () => {
  const obj = new Manager("layers", Layer);

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

  const data = Manager.serializeOfDB(content, Layer);

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

  const data = Manager.serializeOfDB(content, Layer);

  const obj = new Manager("layers", Layer);

  obj.setData(data);
  expect(obj.getItem("0")).toBeInstanceOf(Layer);
  expect(obj.getItem("0").getEnabled()).toBe(true);

  expect(obj.serializeToDB()).toMatchObject(content);
});

test("get a layer instance", () => {
  const obj = new Manager("layers", Layer);

  const content = {
    name: "layer1",
    on: true
  };

  obj.setItem({ name: "0", content });

  const subflow = obj.getItem("0");

  expect(subflow).toBeInstanceOf(Layer);
});
