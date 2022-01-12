import EnvVar from "./EnvVar";

test("Smoke test", () => {
  const obj = new EnvVar();

  expect(obj).toBeInstanceOf(EnvVar);
  expect(obj.getValue()).toBe("");
});

test("Serialize to DB", () => {
  const envvar = new EnvVar();

  const data = {
    name: "param1",
    value: "/opt/movai",
    description: "test param1"
  };
  envvar.setData(data);

  const expected = { Value: data.value, Description: data.description };

  expect(envvar.serializeToDB()).toMatchObject(expected);
});

test("Serialize OF db", () => {
  const content = {
    envvar1: { Value: "/opt/movai", Description: "test envvar1" }
  };

  const expected = {
    name: "envvar1",
    value: content.envvar1.Value,
    description: content.envvar1.Description
  };

  const data = EnvVar.serializeOfDB(content);

  expect(data).toMatchObject(expected);
});
