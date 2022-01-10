import Model from "./Model";

test("Run validate", () => {
  const schema = { validate: a => a };
  const obj = new Model({ schema });

  expect(obj.validate()).toMatchObject({});
});
