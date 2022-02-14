import ConfigurationStore from "./ConfigurationStore";
import DBSubscriber from "../DBSubscriber";
import Model from "../../models/Configuration/Configuration";

test("Smoke test", () => {
  const obj = new ConfigurationStore();

  expect(obj).toBeInstanceOf(ConfigurationStore);
});

test("Get plugin loaded", () => {
  const store = new ConfigurationStore();

  expect(store.getPlugin("DBSubscriber")).toBeInstanceOf(DBSubscriber);
});

test("Validate defaults", () => {
  const store = new ConfigurationStore();

  expect(store.workspace).toBe("global");
  expect(store.name).toBe("Configuration");
  expect(store.title).toBe("Configurations");
  expect(store.model).toBe(Model);
});
