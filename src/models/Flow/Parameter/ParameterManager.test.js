import Parameters from "./ParameterManager";

test("serialize OF db", () => {
  const data = {
    param1: {
      Value: 40,
      Description: "max speed"
    },
    param2: {
      Value: 10,
      Description: "min speed"
    }
  };

  const obj = Parameters.serializeOfDB(data);

  expect(obj).toBeInstanceOf(Parameters);
  expect(obj.getParameter("param1").getValue()).toBe(data.param1.Value);
  expect(obj.getParameter("param2").getDescription()).toBe(
    data.param2.Description
  );
});

test("serialize TO db", () => {
  const data = {
    param1: {
      Value: 40,
      Description: "max speed"
    },
    param2: {
      Value: 10,
      Description: "min speed"
    }
  };

  const obj = Parameters.serializeOfDB(data);

  expect(obj).toBeInstanceOf(Parameters);
  expect(obj.serializeToDB()).toMatchObject(data);
});

test("update parameter", () => {
  const data = {
    param1: {
      Value: 40,
      Description: "max speed"
    },
    param2: {
      Value: 10,
      Description: "min speed"
    }
  };

  const obj = Parameters.serializeOfDB(data);
  const value = 80;

  obj.updateParameter({ name: "param1", content: { value } });

  expect(obj.getParameter("param1").getValue()).toBe(value);
});
