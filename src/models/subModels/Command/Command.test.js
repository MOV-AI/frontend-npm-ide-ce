import Command from "./Command";

test("Smoke test", () => {
  const obj = new Command();

  expect(obj).toBeInstanceOf(Command);
  expect(obj.getValue()).toBe("");
});

test("Serialize to DB", () => {
  const cmd = new Command();

  const data = { name: "cmd1", value: "file.sh", description: "test cmd1" };
  cmd.setData(data);

  const expected = { Value: data.value, Description: data.description };

  expect(cmd.serializeToDB()).toMatchObject(expected);
});

test("Serialize OF db", () => {
  const content = {
    cmd1: { Value: "file.sh", Description: "test cmd1" }
  };

  const expected = {
    name: "cmd1",
    value: content.cmd1.Value,
    description: content.cmd1.Description
  };

  const data = Command.serializeOfDB(content);

  expect(data).toMatchObject(expected);
});
