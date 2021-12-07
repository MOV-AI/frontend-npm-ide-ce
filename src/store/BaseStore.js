import { Document } from "@mov-ai/mov-fe-lib-core";
import Subscriber from "../subscriber/Subscriber";

class BaseStore {
  constructor(args) {
    const { workspace, model, plugin, name, title, pattern, observer } = args;

    this._workspace = workspace || "global";
    this._plugin = plugin;
    this._model = model;
    this._scope = model.SCOPE;
    this._name = name || "Store";
    this._title = title || "Generic Store";
    this.pattern = pattern || { Scope: this.scope, Name: "*", Label: "*" };
    this.observer = observer;

    this.enableSubscriber();
  }

  // Data store
  data = new Map();

  get workspace() {
    return this._workspace;
  }

  get name() {
    return this._name;
  }

  get plugin() {
    return this._plugin;
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
    const obj = this.data
      .set(doc.name, this.model.ofJSON(doc.content))
      .get(doc.name);

    obj.subscribe((instance, prop, value) =>
      this.onDocumentUpdate(instance, prop, value)
    );

    return obj;
  }

  loadDoc(name) {
    const { scope } = this;
    return new Document(Document.parsePath(name, scope))
      .read()
      .then(file => {
        const obj = this.addDoc({
          name: file.Label,
          content: file
        });
        return obj.setIsLoaded(true);
      })
      .catch(err => {
        if (err.status === 404) {
          return this.newDoc(name);
        }
      });
  }

  getDoc(name) {
    return this.data.get(name);
  }

  setDoc(name, value) {
    return this.data.set(name, value);
  }

  deleteDocFromStore(name) {
    this.getDoc(name)?.destroy();
    this.data.delete(name);
    return this;
  }

  generateName(next = 1) {
    const name = `untitled-${next}`;
    return this.data.has(name) ? this.generateName(next + 1) : name;
  }

  //========================================================================================
  /*                                                                                      *
   *                                         Events                                       *
   *                                                                                      */
  //========================================================================================

  getUpdateDoc() {
    const docType = this.scope;

    const event2actionMap = {
      del: updateDoc => {
        this.deleteDocFromStore(updateDoc.name);
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

        if (typeof this.observer?.onUpdate === "function") {
          this.observer.onUpdate(this.name, {
            documentName: docName,
            documentType: docType
          });
        }
      }
    };
  }

  loadDocs(data) {
    const docType = this.scope;

    Object.values(data.value[docType])
      .map(doc => {
        // get previously loaded data
        const prevLoaded = this.getDoc(doc.Label)?.serializeToDB() || {};

        return {
          name: doc.Label,
          content: { ...prevLoaded, ...doc }
        };
      })
      .forEach(doc => this.addDoc(doc));

    if (typeof this.observer?.onLoad === "function") {
      this.observer.onLoad(this.name);
    }
  }

  onDocumentUpdate(instance, prop, value) {
    if (typeof this.observer.onDocumentDirty === "function") {
      this.observer.onDocumentDirty(this.name, instance, instance.getDirty());
    }
  }

  enableSubscriber() {
    this.subscriber = new Subscriber({
      pattern: this.pattern
    });
    this.subscriber.subscribe(this.getUpdateDoc(), data => this.loadDocs(data));
  }

  destroy() {
    if (this.subscriber) this.subscriber.destroy();
  }
}

export default BaseStore;
