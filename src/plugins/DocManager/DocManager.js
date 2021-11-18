import IDEPlugin from "../../engine/IDEPlugin/IDEPlugin";
import { MasterDB, Document } from "@mov-ai/mov-fe-lib-core";
import { MODELS_CLASS_BY_NAME } from "../../models";
import { Maybe } from "monet";
import Configuration from "../views/editors/Configuration/Configuration";

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
  constructor(profile) {
    // Remove duplicated if needed
    const methods = Array.from(
      new Set([
        ...(profile.methods || []),
        "getDocTypes",
        "getDocPlugin",
        "getDocsFromType",
        "getDocFromNameType",
        "read"
      ])
    );
    super({ ...profile, methods });
    this.docsMap = INITIAL_DOCS_MAP;
  }

  activate() {
    this.docsSubscribe();
  }

  /**
   * Returns array of document types
   * @returns {Array<{name: String, title: String, scope: String}>} 
   */
  getDocTypes() {
    return Object.values(this.docsMap).map(type => ({ name: type.name, title: type.title, scope: type.scope  }));
  }

  /**
   * Returns Type object
   * @param {String} type
   * @returns {DocCollection} 
   */
  getDocPlugin(type) {
    return this.docsMap[type].plugin
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
   * Read model from DB
   * @param {{name: String, scope: String}} modelKey
   *
   * @returns {Promise<Model>}
   */
  read(modelKey) {
    const { name, scope } = modelKey;
    return new Document(Document.parsePath(name, scope)).read().then(file => {
      this.addDoc(scope, {
        name: file.Label,
        content: file
      });
      return this.getDocFromNameType(name, scope);
    });
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
      if (!(docName in documentsOfType)) {
        documentsOfType[docName] = MODELS_CLASS_BY_NAME[docType].ofJSON(
          doc.content
        );
      }
    }
    return this;
  }

  /**
   * update doc
   * @param {String} docType
   * @param {{name: String, content:Object}} doc
   */
  updateDoc(docType, doc) {}

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
