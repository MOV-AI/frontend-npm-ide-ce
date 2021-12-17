import Command from "./Command";

test("smoke test", () => {
  const obj = new Command();

  expect(obj).toBeInstanceOf(Command);
  expect(obj.getValue()).toBe("");
});

test("serialize to DB", () => {
  const cmd = new Command();

  const data = { name: "cmd1", value: "file.sh" };
  cmd.setData(data);

  const expected = { Value: data.value };

  expect(cmd.serializeToDB()).toMatchObject(expected);
});

test("serialize OF db", () => {
  const content = {
    cmd1: { Value: "file.sh" }
  };

  const expected = {
    name: "cmd1",
    value: content.cmd1.Value
  };

  const data = Command.serializeOfDB(content);

  expect(data).toMatchObject(expected);
});
