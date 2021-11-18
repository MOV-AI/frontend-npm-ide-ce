import IDEPlugin from "../../engine/IDEPlugin/IDEPlugin";
import { MasterDB } from "@mov-ai/mov-fe-lib-core";
import { MODELS_CLASS_BY_NAME } from "../../models";
import { Maybe } from "monet";

const INITIAL_DOCS_MAP = {
  Callback: {
    name: "Callback",
    title: "Callbacks",
    scope: "Callback",
    docs: {}
  },
  Configuration: {
    name: "Configuration",
    title: "Configurations",
    scope: "Configuration",
    docs: {}
  },
  Flow: {
    name: "Flow",
    title: "Flows",
    scope: "Flow",
    docs: {}
  },
  Node: {
    name: "Node",
    title: "Nodes",
    scope: "Node",
    docs: {}
  }
};

/**
 * Document Manager plugin to handle requests, subscribers and more
 */
class DocManager extends IDEPlugin {
  docsMap = INITIAL_DOCS_MAP;

  constructor(profile) {
    // Remove duplicated if needed
    const methods = Array.from(
      new Set([...(profile.methods || []), "getDocTypes", "getDocsFromType"])
    );
    super({ ...profile, methods });
  }

  activate() {
    this.docsSubscribe();
  }

  /**
   *
   * @returns {Array<String>} Array<documentType: String>
   */
  getDocTypes() {
    return Object.keys(this.docsMap);
  }

  /**
   *
   * @param {String} type
   * @returns {Array<Model>} Array<model: Model>
   */
  getDocsFromType(type) {
    const answer = this.docsMap[type]?.docs;
    if (!answer) return [];
    return Object.values(answer);
  }

  /**
   *
   * @param {String} name
   * @param {String} type
   * @returns {Model || undefined}
   */
  getDocFromNameType(name, type) {
    return this.docsMap?.[type]?.docs[name];
  }

  read(path) {}

  //========================================================================================
  /*                                                                                      *
   *                                    PRIVATE METHODS                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Add document
   * @param {String} docType
   * @param {{name:String, content:Object}} doc
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
   */
  delDoc(docType, doc) {
    Maybe.fromNull(this.docsMap[docType]).forEach(
      ({ docs }) => delete docs[doc.name]
    );
  }

  getUpdateDoc(document) {
    const docType = document.name;
    const event2actionMap = {
      del: updateDoc => {
        this.delDoc(docType, { name: updateDoc.name });
        this.emit("updateDocs", this, {
          action: "delete",
          documentName: updateDoc.name,
          documentType: docType
        });
      },
      set: updateDoc => {
        this.addDoc(docType, updateDoc);
        this.emit("updateDocs", this, {
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
      this.emit("loadDocs", this);
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
