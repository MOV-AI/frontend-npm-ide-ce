import DBSubscriber from ".";

class Store {
  get scope() {
    return "Configuration";
  }
}

test("generate id", () => {
  const obj = new DBSubscriber(new Store());
  const scope = "Configuration";
  const docName = "agv1";

  const expected = `${scope}/${docName}`;

  expect(obj.generateId(docName)).toBe(expected);
});

test("validate pattern", () => {
  const obj = new DBSubscriber(new Store());
  const scope = "Configuration";
  const docName = "agv1";

  const expected = { Scope: scope, Name: docName };

  expect(obj.getPattern(docName)).toMatchObject(expected);
});
