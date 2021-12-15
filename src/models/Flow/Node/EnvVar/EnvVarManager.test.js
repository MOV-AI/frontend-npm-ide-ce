import EnvVarManager from "./EnvVarManager";
import EnvVar from "./EnvVar";

test("serialize OF db", () => {
  const content = {
    var1: {
      Value: "/opt/movai"
    },
    var2: {
      Value: "/opt/frontend"
    }
  };

  const expected = {
    var1: {
      name: "var1",
      value: content.var1.Value
    },
    var2: {
      name: "var2",
      value: content.var2.Value
    }
  };

  const data = EnvVarManager.serializeOfDB(content);

  expect(data).toMatchObject(expected);
});

test("serialize TO db", () => {
  const content = {
    var1: {
      Value: "/opt/movai"
    },
    var2: {
      Value: "/opt/frontend"
    }
  };

  const data = EnvVarManager.serializeOfDB(content);

  const obj = new EnvVarManager();
  expect(obj).toBeInstanceOf(EnvVarManager);

  obj.setData(data);
  expect(obj.getEnvVar("var1")).toBeInstanceOf(EnvVar);
  expect(obj.getEnvVar("var1").getValue()).toBe(content.var1.Value);

  expect(obj.serializeToDB()).toMatchObject(content);
});

test("update envvar", () => {
  const envvar = {
    name: "var1",
    content: { value: 40 }
  };

  const value = 80;

  const obj = new EnvVarManager();

  // add parameter
  obj.setEnvVar(envvar);
  expect(obj.getEnvVar("var1")).toBeInstanceOf(EnvVar);

  // update parameter
  obj.updateEnvVar({ name: "var1", content: { value } });

  expect(obj.getEnvVar("var1").getValue()).toBe(value);
});

test("delete parameter", () => {
  const envvar = {
    name: "envvar",
    content: { value: "/opt/movai" }
  };

  const obj = new EnvVarManager();

  // add parameter
  obj.setEnvVar(envvar);
  expect(obj.getEnvVar("envvar")).toBeInstanceOf(EnvVar);

  // delete EnvVar
  expect(obj.deleteEnvVar("envvar")).toBe(true);

  expect(obj.getEnvVar("envvar")).toBe(undefined);
});
