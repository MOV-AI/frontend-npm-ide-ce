import { Document } from "@mov-ai/mov-fe-lib-core";
import Subscriber from "../subscriber/Subscriber";

class BaseStore {
  constructor(profile) {
    const { workspace, model, name, title, pattern } = profile;

    this._workspace = workspace || "global";
    this._model = model;
    this._scope = model.SCOPE;
    this._name = name || "Store";
    this._title = title || "Generic Store";
    this.pattern = pattern || { Scope: this.scope, Name: "*", Label: "*" };

    this.data = new Map();

    console.log(`Store ${this.name} initializing`, this);

    this.enableSubscriber();
  }

  get workspace() {
    return this._workspace;
  }

  get name() {
    return this._name;
  }

  get model() {
    return this._model;
  }

  get scope() {
    return this._scope;
  }

  get title() {
    return this._title;
  }

  addDoc(doc) {
    return this.data
      .set(doc.name, this.model.ofJSON(doc.content))
      .get(doc.name);
  }

  loadDoc(name) {
    const { scope } = this;
    return new Document(Document.parsePath(name, scope)).read().then(file => {
      const obj = this.addDoc({
        name: file.Label,
        content: file
      });
      obj.setIsLoaded(true);
      return obj;
    });
  }

  generateName(next = 1) {
    const name = `untitled-${next}`;
    return this.data.has(name) ? this.generateName(next + 1) : name;
  }

  getUpdateDoc() {
    const docType = this.scope;

    const event2actionMap = {
      del: updateDoc => {
        this.delDoc(updateDoc.name);
      },
      set: updateDoc => {
        this.addDoc(updateDoc);
      }
    };

    return data => {
      if (data.event in event2actionMap) {
        const docName = Object.keys(data.key[docType])[0];
        const docContent = Object.values(data.key[docType])[0];
        event2actionMap[data.event]({ name: docName, content: docContent });
      }
    };
  }

  getRetrieveDoc(data) {
    const docType = this.scope;

    Object.values(data.value[docType])
      .map(doc => ({
        name: doc.Label,
        content: { ...doc }
      }))
      .forEach(doc => this.addDoc(doc));
  }

  enableSubscriber() {
    this.subscriber = new Subscriber({
      pattern: this.pattern
    });
    this.subscriber.subscribe(this.getUpdateDoc(), data =>
      this.getRetrieveDoc(data)
    );
  }

  destroy() {
    if (this.subscriber) this.subscriber.destroy();
  }
}

export default BaseStore;
