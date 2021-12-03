import BaseModel from "./BaseModel";

test("set isDirty on setName", () => {
  const obj = new BaseModel({ name: "test" });
  obj.toDecorate = ["setName"];

  obj.setName("myName");

  expect(obj.getDirty()).toBe(true);
});

test("set isDirty on setDetails", () => {
  const obj = new BaseModel({ name: "test" });
  obj.toDecorate = ["setDetails"];

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
