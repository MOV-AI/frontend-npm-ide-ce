import PyLib from "./PyLib";

test("Smoke test", () => {
  const obj = new PyLib();

  expect(obj).toBeInstanceOf(PyLib);
});

test("Serialize to DB", () => {
  const lib = new PyLib();

  const data = { name: "lib1", module: "mod1", libClass: "class1" };
  lib.setData(data);

  const expected = {
    Module: "mod1",
    Class: "class1"
  };

  expect(lib.serializeToDB()).toMatchObject(expected);
});

test("Serialize OF db", () => {
  const content = {
    lib1: { Module: "mod1", Class: "class1" }
  };

  const expected = {
    name: "lib1",
    module: "mod1",
    libClass: "class1"
  };

  const data = PyLib.serializeOfDB(content);

  expect(data).toMatchObject(expected);
});
