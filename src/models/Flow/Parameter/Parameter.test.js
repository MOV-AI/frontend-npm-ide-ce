import Parameter from "./Parameter";

test("serialize to DB", () => {
  const param = new Parameter();

  const data = { name: "param1", value: 1981, description: "best year" };
  param.setData(data);

  const expected = { Value: data.value, Description: data.description };

  expect(param.serializeToDB()).toMatchObject(expected);
});

test("serialize OF db", () => {
  const data = {
    param1: { Value: 1981, Description: "best year" }
  };
  const obj = Parameter.serializeOfDB(data);

  expect(obj).toBeInstanceOf(Parameter);
  expect(obj.getName()).toBe("param1");
  expect(obj.getValue()).toBe(data.param1.Value);
  expect(obj.getDescription()).toBe(data.param1.Description);
});
