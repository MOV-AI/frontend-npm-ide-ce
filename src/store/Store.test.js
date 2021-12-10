import Store from "./Store";

class Model {
  dirty = false;
  getDirty() {
    return this.dirty;
  }
  setDirty(value) {
    this.dirty = true;
  }
  setIsNew() {
    return this;
  }
  setIsLoaded() {
    return this;
  }
  subscribe() {
    return this;
  }
}

test("store should have dirties", () => {
  const store = new Store({ name: "MyStore", model: Model });

  store.newDoc().setDirty(true);

  expect(store.hasDirties()).toBe(true);
});

test("doc should exist", () => {
  const docName = "test";
  const store = new Store({ name: "MyStore", model: Model });

  store.newDoc(docName);

  expect(store.checkDocExists(docName)).toBe(true);
});

test("store should have one doc", () => {
  const docName = "test";
  const store = new Store({ name: "MyStore", model: Model });

  store.newDoc(docName);

  expect(Array.from(store.getDocs()).length).toBe(1);
});
