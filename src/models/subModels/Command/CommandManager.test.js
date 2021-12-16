import CommandManager from "./CommandManager";
import Command from "./Command";

test("smoke test", () => {
  const obj = new CommandManager();

  expect(obj).toBeInstanceOf(CommandManager);
});

test("serialize OF db", () => {
  const content = {
    cmd1: {
      Value: "file.sh"
    },
    cmd2: {
      Value: "file1.sh"
    }
  };

  const expected = {
    cmd1: {
      name: "cmd1",
      value: content.cmd1.Value
    },
    cmd2: {
      name: "cmd2",
      value: content.cmd2.Value
    }
  };

  const data = CommandManager.serializeOfDB(content);

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

  const data = CommandManager.serializeOfDB(content);

  const obj = new CommandManager();
  expect(obj).toBeInstanceOf(CommandManager);

  obj.setData(data);
  expect(obj.getCommand("var1")).toBeInstanceOf(Command);
  expect(obj.getCommand("var1").getValue()).toBe(content.var1.Value);

  expect(obj.serializeToDB()).toMatchObject(content);
});

test("update envvar", () => {
  const cmd = {
    name: "var1",
    content: { value: 40 }
  };

  const value = 80;

  const obj = new CommandManager();

  // add parameter
  obj.setCommand(cmd);
  expect(obj.getCommand("var1")).toBeInstanceOf(Command);

  // update parameter
  obj.updateCommand({ name: "var1", content: { value } });

  expect(obj.getCommand("var1").getValue()).toBe(value);
});

test("delete parameter", () => {
  const cmd = {
    name: "envvar",
    content: { value: "/opt/movai" }
  };

  const obj = new CommandManager();

  // add parameter
  obj.setCommand(cmd);
  expect(obj.getCommand("envvar")).toBeInstanceOf(Command);

  // delete EnvVar
  expect(obj.deleteCommand("envvar")).toBe(true);

  expect(obj.getCommand("envvar")).toBe(undefined);
});
