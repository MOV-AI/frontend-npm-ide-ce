import Parameter from "./Parameter";

test("Smoke test", () => {
  const obj = new Parameter({ name: "param1" });

  expect(obj).toBeInstanceOf(Parameter);
  expect(obj.getName()).toBe("param1");
  expect(obj.getDescription()).toBe("");
  expect(obj.getType()).toBe("any");
});

test("Serialize to DB", () => {
  const param = new Parameter();

  const data = { name: "param1", value: 1981, description: "best year" };
  param.setData(data);

  const expected = {
    Value: data.value,
    Type: "any",
    Description: data.description
  };

  expect(param.serializeToDB()).toMatchObject(expected);
});

test("Serialize OF db", () => {
  const content = {
    param1: { Value: 1981, Description: "best year", Type: "boolean" }
  };

  const expected = {
    name: "param1",
    value: content.param1.Value,
    type: "boolean",
    description: content.param1.Description
  };

  const data = Parameter.serializeOfDB(content);

  expect(data).toMatchObject(expected);
});
