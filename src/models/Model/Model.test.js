import Model from "./Model";

test("run validate", () => {
  const schema = { validate: a => a };
  const obj = new Model({ schema });

  expect(obj.validate()).toMatchObject({});
});
