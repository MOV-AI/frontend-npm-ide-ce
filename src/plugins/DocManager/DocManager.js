import IDEPlugin from "../../engine/IDEPlugin/IDEPlugin";
import docsFactory from "./docs";
import TOPICS from "./topics";

/**
 * Document Manager plugin to handle requests, subscribers and more
 */
class DocManager extends IDEPlugin {
  constructor(profile = {}) {
    // Remove duplicated if needed
    const methods = Array.from(
      new Set([
        ...(profile.methods ?? []),
        "getDocTypes",
        "getDocFactory",
        "getDocFromNameType",
        "checkDocumentExists",
        "discardDocChanges",
        "reloadDoc",
        "copy",
        "delete",
        "create",
        "read",
        "save"
      ])
    );
    super({ ...profile, methods });
    // Used to debug docManager in console
    window.DocManager = this;
    // Add unload events
    window.onbeforeunload = this.onBeforeUnload;
    window.onunload = this.onUnload;
  }

  activate() {
    const observer = {
      onLoad: store => this.onStoreLoad(store),
      onUpdate: (store, doc, action) => this.onStoreUpdate(store, doc, action),
      onDocumentDirty: (store, instance, value) =>
        this.onDocumentDirty(store, instance, value),
      onDocumentDeleted: (store, name) => this.onDocumentDeleted(store, name)
    };

    this.docsMap = docsFactory("global", observer);
  }

  /**
   * Returns the factory of the documents
   * @param {string} name The name of the factory
   * @returns {object} The factory of the documents
   */
  getDocFactory(name) {
    return this.docsMap[name];
  }

  /**
   * Returns document available
   * @returns {Array<{name: String, title: String, scope: String}>}
   */
  getDocTypes() {
    return Object.values(this.docsMap).map(docFactory => ({
      name: docFactory.store.name,
      title: docFactory.store.title,
      scope: docFactory.store.scope
    }));
  }

  /**
   * Returns a list of the stores available
   * @returns {Array<Store>} List of stores
   */
  getStores() {
    return Object.values(this.docsMap).map(i => i.store);
  }

  /**
   * Returns the store object or undefined
   * @param {string} name The name of the store
   * @returns {Object<Store>}
   */
  getStore(name) {
    return this.docsMap[name]?.store;
  }

  /**
   * Returns data model from name and type
   * @param {String} name
   * @param {String} scope
   * @returns {Model || undefined}
   */
  getDocFromNameType(name, scope) {
    return this.read({ name, scope });
  }

  /**
   * Check if document already exists
   * @param {{name: String, scope: String}} modelKey
   * @returns {Promise<{result: Boolean, error: String}>}
   */
  checkDocumentExists(modelKey) {
    const { name, scope } = modelKey;
    return this.getStore(scope)?.checkDocExists(name);
  }

  /**
   * Discard document changes
   * @param {{name: String, scope: String}} modelKey
   */
  discardDocChanges(modelKey) {
    const { name, scope } = modelKey;
    return this.getStore(scope)?.discardDocChanges(name);
  }

  /**
   * Reload document data
   * @param {{name: String, scope: String}} modelKey
   */
  reloadDoc(modelKey) {
    const { name, scope } = modelKey;
    return this.getStore(scope)?.loadDoc(name);
  }

  /**
   * Read model from DB
   * @param {{name: String, scope: String}} modelKey
   * @returns {Promise<Model>}
   */
  read(modelKey) {
    const { name, scope } = modelKey;
    return this.getStore(scope)?.readDoc(name) ?? Promise.reject();
  }

  /**
   * Update existing document
   * @param {{name: String, scope: String}} modelKey
   * @param {String} newName : Used in document creation, where we need to replace "untitled" by newName
   * @returns {Promise<Model>}
   */
  save(modelKey, newName) {
    const { name, scope } = modelKey;
    return this.getStore(scope).saveDoc(name, newName);
  }

  /**
   * Create new document
   * @param {{name: String, scope: String}} modelKey
   * @returns {Object<Model>}
   */
  create(modelKey) {
    const { name, scope } = modelKey;
    return this.getStore(scope)?.newDoc(name);
  }

  /**
   * Create copy of document
   * @param {{name: String, scope: String}} modelKey : Reference model
   * @param {String} newName : Copy name
   */
  copy(modelKey, newName) {
    const { name, scope } = modelKey;
    return this.getStore(scope)?.copyDoc(name, newName);
  }

  /**
   * Delete document from DB
   * @param {{name: String, scope: String}} modelKey
   */
  delete(modelKey) {
    const { name, scope } = modelKey;
    return this.getStore(scope)?.deleteDoc(name);
  }

  /**
   * Verifies if at least a store has one or more documents changed
   * @returns {Boolean}
   */
  hasDirties() {
    return this.getStores().some(store => store.hasDirties());
  }

  /**
   * Saves all the changed documents
   * @returns {Promise<Array>}
   */
  saveDirties() {
    const promises = this.getStores().map(store => {
      return store.saveDirties();
    });

    return Promise.allSettled(promises);
  }

  //========================================================================================
  /*                                                                                      *
   *                                        Events                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Emits an event when a store fires an onLoad event
   * @param {string} store : The name of the store firing the event
   */
  onStoreLoad(store) {
    this.emit(TOPICS.loadDocs, this);
  }

  /**
   * Emits an event when a store fires an onUpdate event
   * @param {string} store : The name of the store firing the event
   * @param {object<{documentName, documentType}>} doc
   */
  onStoreUpdate(store, doc, action = "set") {
    this.emit(TOPICS.updateDocs, this, {
      action,
      ...doc
    });
  }

  /**
   * Emits an event when a document is set to dirty
   * @param {string} store : The name of the store firing the event
   * @param {model} instance : Document model instance
   * @param {boolean} value : Document Dirty state
   */
  onDocumentDirty(store, instance, value) {
    this.emit(TOPICS.updateDocDirty, {
      instance,
      value
    });
  }

  /**
   * Emits an event when a document is deleted
   * @param {{url: string, name: string}} data : Document data
   */
  onDocumentDeleted(store, data) {
    this.emit(TOPICS.deleteDoc, { ...data, scope: store });
  }

  /**
   * Event triggered before unloading app (before close or before refreshing)
   * @param {Event} event
   */
  onBeforeUnload = event => {
    if (this.hasDirties()) {
      event.preventDefault();
      return "You have unsaved documents. Are you sure you want to quit?";
    }
  };

  /**
   * Event triggered when app unloads (user did close or refreshed page)
   *  Discard changes
   *  Remove subscribers
   * @param {Event} event
   */
  onUnload = event => {
    this.getStores().forEach(store => {
      const dirtyDocs = store.getDirties();

      dirtyDocs.forEach(doc => {
        const { url, name, scope } = doc.serialize();
        // Discard dirty document changes
        this.discardDocChanges({ scope, name });
        // Emit event to close untitled tabs
        if (doc.getIsNew()) this.emit(TOPICS.deleteDoc, { url, name, scope });
      });
      // Destroy store to kill subscribers
      store.destroy();
    });
  };
}

export default DocManager;
