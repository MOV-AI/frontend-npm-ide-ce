import IDEPlugin from "../../engine/IDEPlugin/IDEPlugin";
import { MasterDB, Document } from "@mov-ai/mov-fe-lib-core";
import { MODELS_CLASS_BY_NAME } from "../../models";
import { Maybe } from "monet";
import Configuration from "../views/editors/Configuration/Configuration";
import storesBuilder from "./stores";

const INITIAL_DOCS_MAP = {
  Callback: {
    name: "Callback",
    title: "Callbacks",
    scope: "Callback",
    plugin: {},
    docs: {}
  },
  Configuration: {
    name: "Configuration",
    title: "Configurations",
    scope: "Configuration",
    plugin: Configuration,
    docs: {}
  },
  Flow: {
    name: "Flow",
    title: "Flows",
    scope: "Flow",
    plugin: {},
    docs: {}
  },
  Node: {
    name: "Node",
    title: "Nodes",
    scope: "Node",
    plugin: {},
    docs: {}
  }
};

const TOPICS = {
  updateDocs: "updateDocs",
  loadDocs: "loadDocs"
};

/**
 * Document Manager plugin to handle requests, subscribers and more
 */
class DocManager extends IDEPlugin {
  constructor(profile = {}) {
    // Remove duplicated if needed
    const methods = Array.from(
      new Set([
        ...(profile.methods || []),
        "getDocTypes",
        "getDocPlugin",
        "getDocsFromType",
        "getDocFromNameType",
        "checkDocumentExists",
        "copy",
        "delete",
        "create",
        "read",
        "save"
      ])
    );
    super({ ...profile, methods });
    this.docsMap = INITIAL_DOCS_MAP;
    this.stores = storesBuilder("global");
    window.DocManager = this;
  }

  activate() {
    this.docsSubscribe();
  }

  /**
   * Returns array of document types
   * @returns {Array<{name: String, title: String, scope: String}>}
   */
  getDocTypes() {
    return Object.values(this.docsMap).map(type => ({
      name: type.name,
      title: type.title,
      scope: type.scope
    }));
  }
  /**
   *
   * @returns {Array} List of stores
   */
  getStores() {
    return Object.values(this.stores).map(i => i.store);
  }

  getStore(name) {
    return this.stores[name]?.store;
  }

  /**
   * Returns Type object
   * @param {String} type
   * @returns {DocCollection}
   */
  getDocPlugin(type) {
    return this.docsMap[type].plugin;
  }

  /**
   * Returns array of data models from type
   * @param {String} type
   * @returns {Array<Model>} Array<model: Model>
   */
  getDocsFromType(type) {
    const answer = this.docsMap[type]?.docs;
    if (!answer) return [];
    return Object.values(answer);
  }

  /**
   * Returns data model from name and type
   * @param {String} name
   * @param {String} type
   * @returns {Model || undefined}
   */
  getDocFromNameType(name, type) {
    return this.docsMap?.[type]?.docs[name];
  }

  /**
   * Check if document already exists
   * @param {{name: String, scope: String}} modelKey
   * @returns {Promise<{result: Boolean, error: String}>}
   */
  checkDocumentExists({ name, scope, workspace = "global", version = "-" }) {
    // Check if document name already exists
    return Document.exists({
      name,
      scope,
      workspace,
      version
    })
      .then(docExists => {
        const type = workspace === "global" ? "Document" : "Version";
        const error = docExists ? `${type} already exists` : "";
        return { result: !docExists, error };
      })
      .catch(err => {
        return { result: false, error: `${scope} already exists` };
      });
  }

  /**
   * Read model from DB
   * @param {{name: String, scope: String}} modelKey
   * @returns {Promise<Model>}
   */
  read(modelKey) {
    const { name, scope } = modelKey;
    return this.getStore(scope)?.readDoc(name) || Promise.reject();
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
   * @returns {Promise<Model>}
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
    console.log("debug copy document", newName, modelKey);
  }

  /**
   * Delete document from DB
   * @param {{name: String, scope: String}} modelKey
   */
  delete(modelKey) {
    const { name, scope } = modelKey;
    return this.getStore(scope)?.deleteDoc(name);
  }

  //========================================================================================
  /*                                                                                      *
   *                                    PRIVATE METHODS                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Add document
   * @param {String} docType
   * @param {{name:String, content:Object}} doc,
   * @returns {DocManager}
   */
  addDoc(docType, doc) {
    if (docType in this.docsMap) {
      const documentsOfType = this.docsMap[docType].docs;
      const docName = doc.name;
      documentsOfType[docName] = MODELS_CLASS_BY_NAME[docType].ofJSON(
        doc.content
      );
    }
    return this;
  }

  /**
   * update doc
   * @param {String} docType
   * @param {{name: String, content:Object}} doc
   */
  updateDoc(docType, doc) {
    console.log("debug TO BE IMPLEMENTED updateDoc", docType, doc);
  }

  /**
   * Delete document
   * @param {String} docType
   * @param {{name:String, content:Object}} doc
   * @returns {DocManager}
   */
  delDoc(docType, doc) {
    Maybe.fromNull(this.docsMap[docType]).forEach(
      ({ docs }) => delete docs[doc.name]
    );
    return this;
  }

  getUpdateDoc(document) {
    const docType = document.name;
    const event2actionMap = {
      del: updateDoc => {
        this.delDoc(docType, { name: updateDoc.name });
        this.emit(TOPICS.updateDocs, this, {
          action: "delete",
          documentName: updateDoc.name,
          documentType: docType
        });
      },
      set: updateDoc => {
        this.addDoc(docType, updateDoc);
        this.emit(TOPICS.updateDocs, this, {
          action: "update",
          documentName: updateDoc.name,
          documentType: docType
        });
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

  getRetrieveDoc(document) {
    return data => {
      console.log("debug data", data);
      const docType = document.name;
      Object.values(data.value[docType])
        .map(doc => ({
          name: doc.Label,
          content: { ...doc }
        }))
        .forEach(doc => this.addDoc(docType, doc));
      this.emit(TOPICS.loadDocs, this);
    };
  }

  docsSubscribe() {
    Object.values(this.docsMap).forEach(doc => {
      MasterDB.subscribe(
        { Scope: doc.scope, Name: "*", Label: "*" },
        this.getUpdateDoc(doc),
        this.getRetrieveDoc(doc)
      );
    });
  }
}

export default DocManager;
