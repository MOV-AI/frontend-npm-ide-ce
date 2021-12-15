import ParameterManager from "./ParameterManager";
import Parameter from "./Parameter";

test("smoke test", () => {
  const obj = new ParameterManager();

  expect(obj).toBeInstanceOf(ParameterManager);
});

test("serialize OF db", () => {
  const content = {
    param1: {
      Value: 40,
      Description: "max speed"
    },
    param2: {
      Value: 10,
      Description: "min speed"
    }
  };

  const expected = {
    param1: {
      name: "param1",
      value: content.param1.Value,
      description: content.param1.Description
    },
    param2: {
      name: "param2",
      value: content.param2.Value,
      description: content.param2.Description
    }
  };

  const data = ParameterManager.serializeOfDB(content);

  expect(data).toMatchObject(expected);
});

test("serialize TO db", () => {
  const content = {
    param1: {
      Value: 40,
      Description: "max speed"
    },
    param2: {
      Value: 10,
      Description: "min speed"
    }
  };

  const data = ParameterManager.serializeOfDB(content);

  const obj = new ParameterManager();
  expect(obj).toBeInstanceOf(ParameterManager);

  obj.setData(data);
  expect(obj.getParameter("param1")).toBeInstanceOf(Parameter);
  expect(obj.getParameter("param1").getValue()).toBe(40);

  expect(obj.serializeToDB()).toMatchObject(content);
});

test("update parameter", () => {
  const param = {
    name: "param1",
    content: { value: 40, description: "max speed" }
  };

  const value = 80;

  const obj = new ParameterManager();

  // add parameter
  obj.setParameter(param);
  expect(obj.getParameter("param1")).toBeInstanceOf(Parameter);

  // update parameter
  obj.updateParameter({ name: "param1", content: { value } });

  expect(obj.getParameter("param1").getValue()).toBe(value);
});

test("delete parameter", () => {
  const param = {
    name: "param1",
    content: { value: 40, description: "max speed" }
  };

  const obj = new ParameterManager();

  // add parameter
  obj.setParameter(param);
  expect(obj.getParameter("param1")).toBeInstanceOf(Parameter);

  // delete parameter
  expect(obj.deleteParameter("param1")).toBe(true);

  expect(obj.getParameter("param1")).toBe(undefined);
});
