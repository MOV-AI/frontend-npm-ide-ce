import { Document } from "@mov-ai/mov-fe-lib-core";
import i18n from "../../i18n/i18n";
import {
  PLUGINS,
  ALERT_SEVERITIES,
  SAVE_OUTDATED_DOC_ACTIONS
} from "../../utils/Constants";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../utils/Messages";
import IDEPlugin from "../../engine/IDEPlugin/IDEPlugin";
import docsFactory from "./docs";

/**
 * Document Manager plugin to handle requests, subscribers and more
 */
class DocManager extends IDEPlugin {
  constructor(profile = {}) {
    // Remove duplicated if needed
    const methods = Array.from(
      new Set([
        ...(profile.methods ?? []),
        ...Object.values(PLUGINS.DOC_MANAGER.CALL)
      ])
    );
    super({ ...profile, methods });
    // Used to debug docManager in console
    window.DocManager = this;
    // Add unload events
    window.onbeforeunload = this.onBeforeUnload;
    window.onunload = this.onUnload;
    // Subscriber
    this.docSubscriptions = new Map();
    this.saveStack = new Map();
  }

  getName() {
    return "DocManager";
  }

  activate() {
    const observer = {
      onLoad: store => this.onStoreLoad(store),
      onUpdate: (store, doc, action) => this.onStoreUpdate(store, doc, action),
      onDocumentDirty: (store, instance, value) =>
        this.onDocumentDirty(store, instance, value),
      onDocumentDeleted: (store, name) => this.onDocumentDeleted(store, name)
    };

    this.docsMap = docsFactory("global", observer, this);
  }

  onDocumentUpdate(doc) {
    this.docSubscriptions.forEach(callback => {
      callback(doc.serializeToDB());
    });
  }

  /**
   * Subscribe Instance to changes
   * @param {object} obj
   * @returns {Promise<Model>}
   */
  subscribeToChanges(id, callback) {
    this.docSubscriptions.set(id, callback);
  }

  /**
   * Unsubscribe Instance to changes
   * @param {object} obj
   * @returns {Promise<Model>}
   */
  unSubscribeToChanges(id) {
    if (this.docSubscriptions.has(id)) {
      return this.docSubscriptions.delete(id);
    }
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
   * @param {Function} callback : Used to call said function after all is done (more reliable than a .then)
   * @returns {Promise<Model>}
   */
  async save(modelKey, callback) {
    const { name, scope, data } = modelKey;

    const thisDoc = await this.read(modelKey);
    const { isNew, isDirty, isOutdated } = thisDoc;

    // let's replace some data locally before saving if it was passed in
    if (data) thisDoc.setData(data);

    if (!isDirty) return;
    if (!isNew && !isOutdated) return this.doSave(modelKey, callback);

    if (this.saveStack.has(`${name}_${scope}`)) return;
    this.saveStack.set(`${name}_${scope}`, { name, scope });

    if (isOutdated) {
      return this.call(
        PLUGINS.DIALOG.NAME,
        PLUGINS.DIALOG.CALL.SAVE_OUTDATED_DOC,
        {
          name,
          scope,
          onSubmit: action => {
            switch (action) {
              case SAVE_OUTDATED_DOC_ACTIONS.UPDATE_DOC:
                // TODO this is not working, needs development from https://movai.atlassian.net/browse/FP-1621
                this.reloadDoc(modelKey);
                this.saveStack.delete(`${name}_${scope}`);
                break;
              case SAVE_OUTDATED_DOC_ACTIONS.OVERWRITE_DOC:
                this.doSave(modelKey, callback);
                break;
              case SAVE_OUTDATED_DOC_ACTIONS.CANCEL:
              default:
                return;
            }
          },
          onClose: () => this.saveStack.delete(`${name}_${scope}`)
        }
      );
    }

    return this.call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.NEW_DOC, {
      scope,
      placeholder: name,
      onSubmit: newName => this.doSave(modelKey, callback, newName),
      onClose: () => this.saveStack.delete(`${name}_${scope}`)
    });
  }

  /**
   * Actually saves the document passed in the "save" function
   * @param {{name: String, scope: String}} modelKey
   * @param {String} newName : Used in document creation, where we need to replace "untitled" by newName
   * @param {Function} callback : Used to call said function after all is done (more reliable than a .then)
   * @returns {Promise<Model>}
   */
  async doSave(modelKey, callback, newName) {
    const { name, scope } = modelKey;
    let returnMessage = { success: false };

    try {
      const model = await this.getStore(scope).saveDoc(name, newName);

      this.emit(PLUGINS.DOC_MANAGER.ON.SAVE_DOC, {
        docManager: this,
        doc: Document.parsePath(name, scope),
        newName
      });

      this.call(PLUGINS.ALERT.NAME, PLUGINS.ALERT.CALL.SHOW, {
        message: i18n.t(SUCCESS_MESSAGES.SAVED_SUCCESSFULLY),
        severity: ALERT_SEVERITIES.SUCCESS
      });

      returnMessage = model;
    } catch (error) {
      returnMessage.message = error;
      console.warn("failed to save document", error);

      this.call(PLUGINS.ALERT.NAME, PLUGINS.ALERT.CALL.SHOW, {
        message: i18n.t(ERROR_MESSAGES.FAILED_TO_SAVE),
        severity: ALERT_SEVERITIES.ERROR
      });
    }

    callback && callback(returnMessage);
    this.saveStack.delete(`${name}_${scope}`);
    return returnMessage;
  }

  /**
   * Saves the tab that is currently active
   */
  saveActiveEditor() {
    this.call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.GET_ACTIVE_TAB).then(tab =>
      this.save({ name: tab.name, scope: tab.scope }, tab.isNew)
    );
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
    this.getStores().forEach(store => {
      store.getDirties().forEach(obj => {
        const { name, isNew } = obj;
        const scope = obj.getScope();
        this.save({ name, scope }, isNew);
      });
    });
  }

  //========================================================================================
  /*                                                                                      *
   *                                        Events                                        *
   *                                                                                      */
  //========================================================================================

  broadcast(event, data) {
    this.emit(event, data);
  }

  /**
   * Emits an event when a store fires an onLoad event
   * @param {string} store : The name of the store firing the event
   */
  onStoreLoad(store) {
    this.emit(PLUGINS.DOC_MANAGER.ON.LOAD_DOCS, this);
  }

  /**
   * Emits an event when a store fires an onUpdate event
   * @param {string} store : The name of the store firing the event
   * @param {object<{documentName, documentType}>} doc
   */
  onStoreUpdate(store, doc, action = "set") {
    this.emit(PLUGINS.DOC_MANAGER.ON.UPDATE_DOCS, this, {
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
    this.emit(PLUGINS.DOC_MANAGER.ON.UPDATE_DOC_DIRTY, {
      instance,
      value
    });
  }

  /**
   * Emits an event when a document is deleted
   * @param {{url: string, name: string}} data : Document data
   */
  onDocumentDeleted(store, data) {
    this.emit(PLUGINS.DOC_MANAGER.ON.DELETE_DOC, { ...data, scope: store });
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
        if (doc.getIsNew())
          this.emit(PLUGINS.DOC_MANAGER.ON.DELETE_DOC, { url, name, scope });
      });
      // Destroy store to kill subscribers
      store.destroy();
    });
  };
}

export default DocManager;
