import EnvVar from "./EnvVar";

test("smoke test", () => {
  const obj = new EnvVar();

  expect(obj).toBeInstanceOf(EnvVar);
  expect(obj.getValue()).toBe("");
});

test("serialize to DB", () => {
  const envvar = new EnvVar();

  const data = { name: "param1", value: "/opt/movai" };
  envvar.setData(data);

  const expected = { Value: data.value };

  expect(envvar.serializeToDB()).toMatchObject(expected);
});

test("serialize OF db", () => {
  const content = {
    envvar1: { Value: "/opt/movai" }
  };

  const expected = {
    name: "envvar1",
    value: content.envvar1.Value
  };

  const data = EnvVar.serializeOfDB(content);

  expect(data).toMatchObject(expected);
});
