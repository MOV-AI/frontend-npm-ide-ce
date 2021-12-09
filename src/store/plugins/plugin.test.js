import { StorePluginManager, StoreAbstractPlugin } from ".";

class A extends StoreAbstractPlugin {}

test("plugin is initialized", () => {
  const obj = new StorePluginManager([A]);

  expect(obj.getPlugin("A")).toEqual(expect.any(A));
});

test("destroy not implemented", () => {
  const obj = new StorePluginManager([A]);

  expect(() => {
    obj.getPlugin("A").destroy();
  }).toThrow();
});
