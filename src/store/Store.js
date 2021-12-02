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
    const obj = new this.model(newName);
    obj.setIsNew(true);
    this.data.set(newName, obj);
    return obj;
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

  saveDoc(name, newName) {
    const { scope } = this;
    const doc = this.data.get(name);
    if (newName) doc.setName(newName);
    const data = doc.serialize();
    const document = new Document(Document.parsePath(name, scope));

    // If is a new document => create document in DB
    // If is not a new document => update in DB
    const saveMethodByState = {
      true: _data => {
        const payload = {
          type: scope,
          name: _data.Label,
          body: _data
        };
        return Document.create(payload).then(res => {
          if (res.success) doc.setIsNew(false);
          return res;
        });
      },
      false: _data => document.overwrite(_data)
    };

    return saveMethodByState[Boolean(doc.isNew).toString()](data);
  }

  copyDoc(name, newName) {
    return this.readDoc(name).then(doc => {
      const newObj = this.model
        .ofJSON(doc.serialize())
        .setIsNew(true)
        .setName(newName);

      this.data.set(newName, newObj);
      this.saveDoc(newName);
    });
  }

  checkDocExists(name) {
    return this.data.has(name);
  }
}

export default Store;
