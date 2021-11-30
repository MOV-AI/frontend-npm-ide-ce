import { Document } from "@mov-ai/mov-fe-lib-core";
import BaseStore from "./BaseStore";

class Store extends BaseStore {
  getDocs() {
    return Array.from(this.data.values());
  }

  readDoc(name) {
    const doc = this.data.get(name);
    return doc?.isLoaded ? Promise.resolve(doc) : this.loadDoc(name);
  }

  newDoc(name) {
    const newName = name || this.generateName();
    const obj = new this.model({ name: newName });
    obj.setIsNew(true);

    return this.data.set(newName, obj);
  }

  deleteDoc(name) {
    return new Document.delete({
      name,
      type: this.scope,
      body: {}
    }).then(() => {
      return this.deleteDocFromStore(name);
    });
  }

  saveDoc(name) {
    const { scope } = this;
    const doc = this.data.get(name);
    const data = doc.serialize();
    const obj = new Document(Document.parsePath(name, scope));
    console.log("debug ", doc, data);

    return doc.isNew ? obj.create(data) : obj.overwrite(data);
  }

  checkDocExists(name) {
    return this.data.has(name);
  }
}

export default Store;
