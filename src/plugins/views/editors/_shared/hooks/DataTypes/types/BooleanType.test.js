import BooleanType from "./BooleanType";

test("Smoke test", () => {
  const obj = new BooleanType({ theme: {} });

  expect(obj).toBeInstanceOf(BooleanType);
});

test("Convert Python string to boolean", () => {
  const obj = new BooleanType({ theme: {} });

  expect(obj.pythonToBool("True")).toBe(true);
  expect(obj.pythonToBool("False")).toBe(false);
  expect(obj.pythonToBool(undefined)).toBe(undefined);
  expect(obj.pythonToBool(null)).toBe(undefined);
  expect(obj.pythonToBool("")).toBe(undefined);
  expect(obj.pythonToBool([])).toBe(undefined);
  expect(obj.pythonToBool({})).toBe(undefined);
});

test("Convert boolean to Python string", () => {
  const obj = new BooleanType({ theme: {} });

  expect(obj.boolToPython(true)).toBe("True");
  expect(obj.boolToPython(false)).toBe("False");
  expect(obj.boolToPython(undefined)).toBe("False");
  expect(obj.boolToPython(null)).toBe("False");
  expect(obj.boolToPython("")).toBe("False");
  expect(obj.boolToPython("True")).toBe("False");
  expect(obj.boolToPython("False")).toBe("False");
  expect(obj.boolToPython([])).toBe("False");
  expect(obj.boolToPython({})).toBe("False");
});
