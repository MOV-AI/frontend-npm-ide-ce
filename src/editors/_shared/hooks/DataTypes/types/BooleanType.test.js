import BooleanType from "./BooleanType";
import { pythonToBool, boolToPython } from "../../../../../../../utils/Utils";

test("Smoke test", () => {
  const obj = new BooleanType({ theme: {} });

  expect(obj).toBeInstanceOf(BooleanType);
});

test("Convert Python string to boolean", () => {
  expect(pythonToBool("True")).toBe(true);
  expect(pythonToBool("False")).toBe(false);
  expect(pythonToBool(undefined)).toBe(undefined);
  expect(pythonToBool(null)).toBe(undefined);
  expect(pythonToBool("")).toBe(undefined);
  expect(pythonToBool([])).toBe(undefined);
  expect(pythonToBool({})).toBe(undefined);
});

test("Convert boolean to Python string", () => {
  expect(boolToPython(true)).toBe("True");
  expect(boolToPython(false)).toBe("False");
  expect(boolToPython(undefined)).toBe("False");
  expect(boolToPython(null)).toBe("False");
  expect(boolToPython("")).toBe("False");
  expect(boolToPython("True")).toBe("False");
  expect(boolToPython("False")).toBe("False");
  expect(boolToPython([])).toBe("False");
  expect(boolToPython({})).toBe("False");
});
