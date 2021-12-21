import FlowStore from "./FlowStore";
import DBSubscriber from "../DBSubscriber";
import Model from "../../models/Flow/Flow";

test("smoke test", () => {
  const obj = new FlowStore();

  expect(obj).toBeInstanceOf(FlowStore);
});

test("Get plugin loaded", () => {
  const store = new FlowStore();

  expect(store.getPlugin("DBSubscriber")).toBeInstanceOf(DBSubscriber);
});

test("Validate defaults", () => {
  const store = new FlowStore();

  expect(store.workspace).toBe("global");
  expect(store.name).toBe("Flow");
  expect(store.title).toBe("Flows");
  expect(store.model).toBe(Model);
});
