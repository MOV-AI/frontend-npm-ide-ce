import ConfigurationStore from "./ConfigurationStore";
import DBSubscriber from "../DBSubscriber";
import Model from "../../models/Configuration/Configuration";

test("get plugin loaded", () => {
  const store = new ConfigurationStore();

  expect(store.getPlugin("DBSubscriber")).toBeInstanceOf(DBSubscriber);
});

test("validate defaults", () => {
  const store = new ConfigurationStore();

  expect(store.workspace).toBe("global");
  expect(store.name).toBe("Configuration");
  expect(store.title).toBe("Configurations");
  expect(store.model).toBe(Model);
});
