import { Document } from "@mov-ai/mov-fe-lib-core";
import { StorePluginManager } from "./plugins";
import Subscriber from "../subscriber/Subscriber";
import { GLOBAL_WORKSPACE } from "../utils/Constants";

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
      docManager,
      plugins
    } = args;

    super(plugins);

    this._workspace = workspace || GLOBAL_WORKSPACE;
    this._plugin = plugin;
    this._model = model;
    this._scope = model.SCOPE;
    this._name = name || "Store";
    this._title = title || "Generic Store";
    this.pattern = pattern || { Scope: this.scope, Name: "*", Label: "*" };
    this.observer = observer;
    this.docManager = docManager;
    this.protectedDocs = [];

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

  /**
   * Loads a document
   * @param {String} name
   * @returns {Object} Loaded Document
   */
  loadDoc(name) {
    return this.fetchDoc(name)
      .then(file => {
        // get or create document
        const obj = this.getDoc(name) || this.newDoc(name).setIsNew(false);

        const data = obj.constructor.serializeOfDB(file);
        return obj
          .enableObservables(false)
          .setData(data)
          .setIsLoaded(true)
          .setDirty(false)
          .enableObservables(true);
      })
      .catch(error => {
        if (error.status === 404) {
          return this.newDoc(name);
        }
      });
  }

  /**
   * Fetches a document
   * @param {String} name
   * @returns {Object} Document
   */
  fetchDoc(name) {
    const { scope } = this;
    return new Document(Document.parsePath(name, scope)).read();
  }

  /**
   * Gets a document from the store
   * @param {String} name
   * @returns {Object} Document
   */
  getDoc(name) {
    return this.data.get(name);
  }

  /**
   * Sets a document in the store
   * @param {String} name
   * @param {Object} value
   * @returns
   */
  setDoc(name, value) {
    return this.data.set(name, value);
  }

  /**
   * Actual delete function
   * @param {String} name
   * @returns
   */
  delDoc(name) {
    return this.data.delete(name);
  }

  /**
   * Deletes a valid document from the store
   * @param {String} name : Name of the document to delete
   * @returns
   */
  deleteDocFromStore(name) {
    this.getDoc(name)?.destroy();
    return this.delDoc(name);
  }

  /**
   * Generates a new document name
   * @param {Int} next
   * @returns {String} Generated name
   */
  generateName(next = 1) {
    const name = `untitled-${next}`;
    return this.data.has(name) ? this.generateName(next + 1) : name;
  }

  /**
   * Rename the document (locally)
   * @param {object} doc The document instance
   * @param {string} newName The new name of the document
   */
  renameDoc(doc, newName) {
    // remove the document from the local store
    this.delDoc(doc.getName());
    // re add the document with the new name
    this.setDoc(newName, doc);

    // rename the instance
    doc.setName(newName);
    // Since we are using the id as the name aswell, let's update it to avoid confusion
    doc.setId(newName);
  }

  //========================================================================================
  /*                                                                                      *
   *                                         Events                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Get updated document
   * @returns {Object} data
   */
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

      // Check if is doc protected
      const isProtected = this.protectedDocs.includes(doc.Label);

      // create only if the instance does not exist yet
      if (!this.getDoc(name) && !isProtected) {
        const newDoc = this.newDoc(name);
        newDoc
          .enableObservables(false)
          .setIsNew(false)
          .setIsLoaded(false)
          .setDirty(false)
          .enableObservables(true);
      }
    });

    // fire subject onLoad
    if (typeof this.observer?.onLoad === "function") {
      this.observer.onLoad(this.name);
    }
  }
  /**
   * Event to handle when document gets updated
   * @param {Object} instance
   * @param {String} _prop
   * @param {String} _value
   */
  onDocumentUpdate(instance, _prop, _value) {
    if (typeof this.observer.onDocumentDirty === "function") {
      this.observer.onDocumentDirty(this.name, instance, instance.getDirty());
    }
  }

  /**
   * Method to enable subscriber
   */
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
