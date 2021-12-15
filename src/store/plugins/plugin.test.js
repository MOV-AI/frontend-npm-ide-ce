import { StorePluginManager, StoreAbstractPlugin } from ".";

class A extends StoreAbstractPlugin {
  name = "test";
}

test("plugin is initialized", () => {
  const obj = new StorePluginManager([A]);

  expect(obj.getPlugin("test")).toBeInstanceOf(A);
});

test("destroy not implemented", () => {
  const obj = new StorePluginManager([A]);

  expect(() => {
    obj.getPlugin("test").destroy();
  }).toThrow();
});
