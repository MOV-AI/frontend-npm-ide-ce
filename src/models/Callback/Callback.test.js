import Callback from "./Callback";

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
    py3Lib: json.Py3Lib
  };

  const obj = Callback.ofJSON(json);

  expect(obj.serialize()).toMatchObject(expected);
  expect(obj.getIsNew()).toBe(false);
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
  expect(obj.getIsNew()).toBe(false);
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
  expect(obj.getIsNew()).toBe(false);
  expect(obj.getIsLoaded()).toBe(false);
  expect(obj.getDirty()).toBe(false);
});
