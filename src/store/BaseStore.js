import { Document } from "@mov-ai/mov-fe-lib-core";
import { StorePluginManager } from "./plugins";
import Subscriber from "../subscriber/Subscriber";

class BaseStore extends StorePluginManager {
  constructor(args) {
    const {
      workspace,
      model,
      plugin,
      name,
      title,
      pattern,
      observer,
      plugins
    } = args;

    super(plugins);

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

  loadDoc(name) {
    return this.fetchDoc(name)
      .then(file => {
        // get or create document
        const obj = this.getDoc(name) || this.newDoc(name).setIsNew(false);

        const data = obj.constructor.serializeOfDB(file);
        return obj.setData(data).setIsLoaded(true).setDirty(false);
      })
      .catch(error => {
        if (error.status === 404) {
          return this.newDoc(name);
        }
      });
  }

  fetchDoc(name) {
    const { scope } = this;
    return new Document(Document.parsePath(name, scope)).read();
  }

  getDoc(name) {
    return this.data.get(name);
  }

  setDoc(name, value) {
    return this.data.set(name, value);
  }

  deleteDocFromStore(name) {
    this.getDoc(name)?.destroy();
    return this.data.delete(name);
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
        if (!this.getDoc(updateDoc.name)) {
          this.newDoc(updateDoc.name);
        }
      }
    };

    return data => {
      if (data.event in event2actionMap) {
        const docName = Object.keys(data.key[docType])[0];
        const docContent = Object.values(data.key[docType])[0];
        event2actionMap[data.event]({ name: docName, content: docContent });

        if (typeof this.observer?.onUpdate === "function") {
          this.observer.onUpdate(
            this.name,
            {
              document: this.data.get(docName),
              documentName: docName,
              documentType: docType
            },
            data.event
          );
        }
      }
    };
  }

  /**
   * Creates the instances for the documents without any content
   * Content is only loaded when the user opens the document
   * @param {object} data Object with the list of existing documents
   */
  loadDocs(data) {
    const docType = this.scope;

    Object.values(data.value[docType]).forEach(doc => {
      const name = doc.Label;

      // create only if the instance does not exist yet
      if (!this.getDoc(name)) {
        this.newDoc(name).setIsNew(false).setIsLoaded(false).setDirty(false);
      }
    });

    // fire subject onLoad
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
    super.destroy();
    if (this.subscriber) this.subscriber.destroy();
  }
}

export default BaseStore;
