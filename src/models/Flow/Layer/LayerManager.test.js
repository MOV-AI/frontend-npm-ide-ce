import LayerManager from "./LayerManager";
import Layer from "./Layer";

test("smoke test", () => {
  const obj = new LayerManager();

  expect(obj).toBeInstanceOf(LayerManager);
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

  const data = LayerManager.serializeOfDB(content);

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

  const data = LayerManager.serializeOfDB(content);

  const obj = new LayerManager();

  obj.setData(data);
  expect(obj.getLayer("0")).toBeInstanceOf(Layer);
  expect(obj.getLayer("0").getEnabled()).toBe(true);

  expect(obj.serializeToDB()).toMatchObject(content);
});

test("get a layer instance", () => {
  const obj = new LayerManager();

  const content = {
    name: "layer1",
    on: true
  };

  obj.setLayer({ name: "0", content });

  const subflow = obj.getLayer("0");

  expect(subflow).toBeInstanceOf(Layer);
});
