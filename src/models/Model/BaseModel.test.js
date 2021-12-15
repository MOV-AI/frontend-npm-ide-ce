import BaseModel from "./BaseModel";

test("set isDirty on setName", () => {
  const obj = new BaseModel({ name: "test" });

  obj.setName("myName");

  expect(obj.getDirty()).toBe(true);
});

test("set isDirty on setDetails", () => {
  const obj = new BaseModel({ name: "test" });

  obj.setDetails({});

  expect(obj.getDirty()).toBe(true);
});

test("get document url", () => {
  const name = "test";
  const workspace = "workspace";

  const obj = new BaseModel({ name, workspace });

  const expected = `workspace/NA/test`;

  expect(obj.getUrl()).toBe(expected);
});

test("get document name", () => {
  const name = "test;";
  const obj = new BaseModel({ name });

  expect(obj.getName()).toBe(name);
});

test("get document details", () => {
  const name = "test;";
  const obj = new BaseModel({ name });

  const expected = { user: "N/A", date: "N/A" };

  expect(obj.getDetails()).toMatchObject(expected);
});

test("create new document", () => {
  const obj = new BaseModel({ name: "test" });

  expect(obj.getIsNew()).toBe(true);
  expect(obj.getIsLoaded()).toBe(false);
  expect(obj.getDirty()).toBe(true);
  expect(obj.getOutdated()).toBe(false);
});

test("create document of JSON", () => {
  const json = {
    workspace: "myworkspace",
    name: "test",
    version: "0.0.1",
    details: { user: "mj", date: "20/04/1981" }
  };

  const obj = BaseModel.ofJSON(json);

  expect(obj.serialize()).toMatchObject({ id: "test", ...json });
  expect(obj.getIsNew()).toBe(true);
  expect(obj.getIsLoaded()).toBe(false);
  expect(obj.getDirty()).toBe(false);
  expect(obj.getOutdated()).toBe(false);
});
