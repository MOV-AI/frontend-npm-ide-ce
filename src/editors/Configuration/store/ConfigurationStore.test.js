import Store from "./ConfigurationStore";
import DBSubscriber from "../DBSubscriber";
import Model from "../models/Configuration";

test("Smoke test", () => {
  const obj = new Store();

  expect(obj).toBeInstanceOf(Store);
});

test("Get plugin loaded", () => {
  const store = new Store();

  expect(store.getPlugin("DBSubscriber")).toBeInstanceOf(DBSubscriber);
});

test("Validate defaults", () => {
  const store = new Store();

  expect(store.workspace).toBe("global");
  expect(store.name).toBe("Configuration");
  expect(store.title).toBe("Configurations");
  expect(store.model).toBe(Model);
});
