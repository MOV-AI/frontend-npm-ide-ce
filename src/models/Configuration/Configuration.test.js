import Configuration from "./Configuration";

test("Set isDirty on setCode", () => {
  const obj = new Configuration({ name: "test" }).setDirty(false);

  obj.setCode("varA: 1");

  expect(obj.getDirty()).toBe(true);
});

test("Set isDirty on setExtension", () => {
  const obj = new Configuration({ name: "test" }).setDirty(false);

  obj.setExtension("yaml");

  expect(obj.getDirty()).toBe(true);
});

test("Create new document", () => {
  const obj = new Configuration({ name: "test" });

  expect(obj.getIsNew()).toBe(true);
  expect(obj.getIsLoaded()).toBe(false);
  expect(obj.getDirty()).toBe(true);
});

test("Create document of JSON", () => {
  const json = {
    workspace: "myworkspace",
    Label: "test",
    version: "0.0.1",
    LastUpdate: { user: "mj", date: "20/04/1981" },
    Yaml: "varA: 1",
    Type: "yaml"
  };

  const expected = {
    id: json.Label,
    name: json.Label,
    code: json.Yaml,
    extension: json.Type,
    details: json.LastUpdate
  };

  const obj = Configuration.ofJSON(json);

  expect(obj.serialize()).toMatchObject(expected);
  expect(obj.getIsNew()).toBe(true);
  expect(obj.getIsLoaded()).toBe(false);
  expect(obj.getDirty()).toBe(false);
});

test("Serialize to database", () => {
  const json = {
    workspace: "myworkspace",
    Label: "test",
    version: "0.0.1",
    LastUpdate: { user: "mj", date: "20/04/1981" },
    Yaml: "varA: 1",
    Type: "yaml"
  };

  const expected = {
    Label: json.Label,
    Yaml: json.Yaml,
    Type: json.Type,
    LastUpdate: json.LastUpdate
  };

  const obj = Configuration.ofJSON(json);

  expect(obj.serializeToDB()).toMatchObject(expected);
  expect(obj.getIsNew()).toBe(true);
  expect(obj.getIsLoaded()).toBe(false);
  expect(obj.getDirty()).toBe(false);
});

test("Verify serialize defaults to DB", () => {
  const json = {
    workspace: "myworkspace",
    Label: "test",
    version: "0.0.1",
    LastUpdate: undefined,
    Yaml: undefined,
    Type: undefined
  };

  const expected = {
    Label: json.Label,
    Yaml: "",
    Type: "yaml",
    LastUpdate: { user: "N/A", date: "N/A" }
  };

  const obj = Configuration.ofJSON(json);

  expect(obj.serializeToDB()).toMatchObject(expected);
  expect(obj.getIsNew()).toBe(true);
  expect(obj.getIsLoaded()).toBe(false);
  expect(obj.getDirty()).toBe(false);
});
