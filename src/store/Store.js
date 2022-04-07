import { Document } from "@mov-ai/mov-fe-lib-core";
import BaseStore from "./BaseStore";

class Store extends BaseStore {
  /**
   * Returns a list of documents instances
   * @returns {Array<{<Model>}}
   */
  getDocs() {
    return Array.from(this.data.values());
  }

  /**
   * Returns a document instance
   * @param {string} name : The name of the document
   * @returns {Promise<{<Model>}}
   */
  readDoc(name) {
    const doc = this.getDoc(name);
    return doc?.isLoaded ? Promise.resolve(doc) : this.loadDoc(name);
  }

  /**
   * Creates a document in the store and returns the instance
   * @param {string} name The name of the document to create
   * @returns {Object<Model>}
   */
  newDoc(docName) {
    const name = docName || this.generateName();

    // create the document instance
    const doc = new this.model({ name });
    doc.setIsNew(true);
    doc.setIsLoaded(true);

    // Add changes subscriber
    doc.subscribe((instance, prop, value) =>
      this.onDocumentUpdate(instance, prop, value)
    );

    // store the document
    this.setDoc(name, doc);
    return doc;
  }

  /**
   * Deletes the document from the store and the database
   * @param {string} name The name of the document to delete
   * @returns {Promise<any>}
   */
  deleteDoc(name) {
    const docUrl = this.data.get(name).getUrl();
    return new Document.delete({
      name,
      type: this.scope,
      body: {}
    })
      .then(a => {
        // delete only if successfully deleted from the database
        return this.deleteDocFromStore(name);
      })
      .then(res => {
        this.observer.onDocumentDeleted(this.name, { name, url: docUrl });
        return res;
      });
  }

  /**
   * Saves the document in the database
   * @param {string} name The name of the document to save
   * @param {string} newName The new name of the document (when renaming)
   * @returns {Promise<{success, name}>}
   */
  saveDoc(name, newName) {
    const { scope } = this;

    // get document from store
    const doc = this.getDoc(name);

    // rename the document
    if (newName) this.renameDoc(doc, newName);

    //get the document data
    const data = doc.serializeToDB();

    // If is a new document => create document in DB
    // If is not a new document => update in DB
    const saveMethodByIsNew = {
      true: _data => {
        const payload = {
          type: scope,
          name: _data.Label,
          body: _data
        };
        return Document.create(payload);
      },
      false: _data => {
        const document = new Document(Document.parsePath(name, scope));
        return document.overwrite(_data);
      }
    };

    return saveMethodByIsNew[doc.getIsNew()](data).then(res => {
      if (res.success) {
        doc.setIsNew(false).setDirty(false);
        this.observer.onDocumentDirty(this.name, doc, doc.getDirty());
        res.model = doc;
      }
      return res;
    });
  }

  /**
   * Create copy of document and save it in DB
   * @param {string} name The name of the document to copy
   * @param {string} newName The name of the new document (copy)
   * @returns {Promise<Model>} Promise resolved after finish copying document
   */
  async copyDoc(name, newName) {
    return this.readDoc(name).then(doc => {
      const newObj = this.model
        .ofJSON(doc.serializeToDB())
        .setIsNew(true)
        .setName(newName);

      this.setDoc(newName, newObj);
      this.saveDoc(newName);

      // Add subscriber to update dirty state
      newObj.subscribe((instance, prop, value) =>
        this.onDocumentUpdate(instance, prop, value)
      );

      // Return copied document
      return newObj;
    });
  }

  /**
   * Checks if a document exists in the store
   * @param {string} name The name of the document to check
   * @returns {Boolean}
   */
  checkDocExists(name) {
    return this.data.has(name);
  }

  /**
   * Returns true if successfully discarded changes
   * @param {string} name The name of the document
   * @returns {boolean}
   */
  discardDocChanges(name) {
    // A new document only exists in the store
    //  so discarding its changes means removing it from the store
    // Otherwise set isLoaded flag to false,
    //  so the next time the user tries to read it:
    //  it will load the doc from redis again
    return this.getDoc(name).getIsNew()
      ? this.deleteDocFromStore(name)
      : Boolean(this.getDoc(name)?.setIsLoaded(false).setDirty(false));
  }

  /**
   * Get all dirty documents
   * @returns {Array} Names of dirty documents from store
   */
  getDirties() {
    return Array.from(this.data.values()).filter(obj => obj.getDirty());
  }

  /**
   * Checks if the store has any documents changed (dirty)
   * @returns {Boolean}
   */
  hasDirties() {
    return this.getDirties().length > 0;
  }

  /**
   * Saves all changed documents
   * @returns {Promise<>}
   */
  saveDirties() {
    const promises = this.getDirties().map(obj => {
      return this.saveDoc(obj.getName());
    });

    return Promise.allSettled(promises);
  }
}

export default Store;
