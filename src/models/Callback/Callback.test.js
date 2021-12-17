import Callback from "./Callback";
import PyLib from "./PyLib/PyLib";

test("smoke test", () => {
  const obj = new Callback();

  expect(obj).toBeInstanceOf(Callback);
});

test("set isDirty on setCode", () => {
  const obj = new Callback({ name: "test" }).setDirty(false);

  obj.setCode("varA: 1");

  expect(obj.getDirty()).toBe(true);
});

test("set isDirty on setMessage", () => {
  const obj = new Callback({ name: "test" }).setDirty(false);

  obj.setMessage("movai_msgs/Any");

  expect(obj.getDirty()).toBe(true);
});

test("create new document", () => {
  const obj = new Callback({ name: "test" });

  expect(obj.getIsNew()).toBe(true);
  expect(obj.getIsLoaded()).toBe(false);
  expect(obj.getDirty()).toBe(true);
});

test("create document of JSON", () => {
  const json = {
    workspace: "myworkspace",
    Label: "test",
    version: "0.0.1",
    LastUpdate: { user: "mj", date: "20/04/1981" },
    Code: "varA: 1",
    Message: "movai_msgs/Any",
    Py3Lib: { math: { Module: "Math", Class: false } }
  };

  const expected = {
    id: json.Label,
    name: json.Label,
    code: json.Code,
    message: json.Message,
    details: json.LastUpdate,
    pyLibs: { math: { module: "Math", libClass: false } }
  };

  const obj = Callback.ofJSON(json);

  expect(obj.serialize()).toMatchObject(expected);
  expect(obj.getIsNew()).toBe(true);
  expect(obj.getIsLoaded()).toBe(false);
  expect(obj.getDirty()).toBe(false);
});

test("serialize to database", () => {
  const json = {
    workspace: "myworkspace",
    Label: "test",
    version: "0.0.1",
    LastUpdate: { user: "mj", date: "20/04/1981" },
    Code: "varA: 1",
    Message: "movai_msgs/Any",
    Py3Lib: { math: { Module: "Math", Class: false } }
  };

  const expected = {
    Label: json.Label,
    Code: json.Code,
    Message: json.Message,
    Py3Lib: json.Py3Lib,
    LastUpdate: json.LastUpdate
  };

  const obj = Callback.ofJSON(json);

  expect(obj.serializeToDB()).toMatchObject(expected);
  expect(obj.getIsNew()).toBe(true);
  expect(obj.getIsLoaded()).toBe(false);
  expect(obj.getDirty()).toBe(false);
});

test("verify serialize defaults to DB", () => {
  const json = {
    workspace: "myworkspace",
    Label: "test",
    version: "0.0.1",
    LastUpdate: undefined,
    Code: undefined,
    Message: undefined,
    Py3Lib: undefined
  };

  const expected = {
    Label: json.Label,
    Code: "",
    Message: "",
    Py3Lib: {},
    LastUpdate: { user: "N/A", date: "N/A" }
  };

  const obj = Callback.ofJSON(json);

  expect(obj.serializeToDB()).toMatchObject(expected);
  expect(obj.getIsNew()).toBe(true);
  expect(obj.getIsLoaded()).toBe(false);
  expect(obj.getDirty()).toBe(false);
});

test("add single import", () => {
  const name = "math";
  const content = { module: "math", libClass: false };

  const obj = new Callback();

  obj.getPyLibs().setItem({ name, content });

  expect(obj.getPyLibs().getItem("math")).toBeInstanceOf(PyLib);
});

test("add imports", () => {
  const data = { math: { module: "math", libClass: false } };

  const obj = new Callback();

  obj.getPyLibs().setData(data);

  expect(obj.getPyLibs().getItem("math")).toBeInstanceOf(PyLib);
});

test("delete import", () => {
  const data = { math: { module: "math", libClass: false } };

  const obj = new Callback();

  obj.getPyLibs().setData(data);

  // delete pylib
  obj.getPyLibs().deleteItem("math");

  expect(obj.getPyLibs().getItem("math")).toBe(undefined);
});

test("update import", () => {
  const data = { math: { module: "math", libClass: false } };

  const obj = new Callback();

  obj.getPyLibs().setData(data);

  // update pylib
  obj.getPyLibs().updateItem({ name: "math", content: { module: "math1" } });

  expect(obj.getPyLibs().getItem("math").getModule()).toBe("math1");
});
