import NumberType from "./NumberType";

const batteryOfTests = [
  { value: "0", expectedSuccess: true },
  { value: "125", expectedSuccess: true },
  { value: "0125", expectedSuccess: true },
  { value: "00125", expectedSuccess: true },
  { value: "01.25", expectedSuccess: true },
  { value: "01,25", expectedSuccess: false },
]

test("Smoke test", () => {
  const obj = new NumberType({ theme: {} });

  expect(obj).toBeInstanceOf(NumberType);
});

batteryOfTests.forEach(t => {
  test(`Check if ${t.value} is valid number`, () => {
    const obj = new NumberType({ theme: {} });
    
    return obj.validate(t.value).then(res => {
      expect(res.success).toBe(t.expectedSuccess);
      expect(res.parsed).toBe(obj.parseValueToFloat(t.value));
    });
  });
});
