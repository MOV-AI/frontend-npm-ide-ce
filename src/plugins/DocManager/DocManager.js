import IDEPlugin from "../../engine/IDEPlugin/IDEPlugin";
import { MasterDB } from "@mov-ai/mov-fe-lib-core";
import { MODELS_CLASS_BY_NAME } from "../../models";
import Configuration from "../views/editors/Configuration/Configuration";

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
    plugin: Configuration,
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
  constructor(profile) {
    // Remove duplicated if needed
    const methods = Array.from(
      new Set([
        ...(profile.methods || []),
        "getDocTypes",
        "getDocsFromType",
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
   *
   * @returns {Array<String>} Array<documentType: String>
   */
  getDocTypes() {
    return this.docsMap;
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
   * Request document data
   * @param {DocumentRequest} data
   */
  read(data) {
    const { scope, name } = data;
    const model = new MODELS_CLASS_BY_NAME[scope](name);
    // mock model data
    model?.mock();
    // return model with mocked data
    return model;
  }

  //========================================================================================
  /*                                                                                      *
   *                                    PRIVATE METHODS                                   *
   *                                                                                      */
  //========================================================================================

  getUpdateDoc(document) {
    return data => {
      this.emit("loadDocs", this);
    };
  }

  addDocs(docType, docs) {
    if (docType in this.docsMap) {
      const documentsOfType = this.docsMap[docType].docs;
      Object.keys(docs).forEach(key => {
        const docLabel = docs[key].Label;
        if (!(docLabel in documentsOfType)) {
          documentsOfType[docLabel] = MODELS_CLASS_BY_NAME[docType].ofBEJSON(
            docs[key]
          );
        }
      });
    }
  }

  getRetrieveDoc(document) {
    return data => {
      const docType = document.name;
      this.addDocs(docType, data.value[docType]);
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
