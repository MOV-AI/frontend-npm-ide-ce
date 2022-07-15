import CallbackStore from "./CallbackStore";

test("Smoke test", () => {
  const obj = new CallbackStore();

  expect(obj).toBeInstanceOf(CallbackStore);
});
