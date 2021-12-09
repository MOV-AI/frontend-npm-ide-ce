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
    if (newName) doc.setName(newName);

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

    return saveMethodByIsNew[doc.isNew](data).then(res => {
      if (res.success) {
        doc.setIsNew(false).setDirty(false);
        this.observer.onDocumentDirty(this.name, doc, doc.getDirty());
      }
      return res;
    });
  }

  /**
   *
   * @param {string} name The name of the document to copy
   * @param {string} newName The name of the new document (copy)
   * @returns {Promise<>}
   */
  copyDoc(name, newName) {
    return this.readDoc(name).then(doc => {
      const newObj = this.model
        .ofJSON(doc.serializeToDB())
        .setIsNew(true)
        .setName(newName);

      this.setDoc(newName, newObj);
      this.saveDoc(newName);
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
   * Discard document changes
   * @param {string} name The name of the document to perform action
   */
  discardDocChanges(name) {
    // A new document only exists in the store
    //  so discarding its changes means removing it from the store
    if (this.getDoc(name).getIsNew()) {
      return Promise.resolve(this.deleteDocFromStore(name));
    }
    // Set isLoaded flag to false,
    //  so the next time the user tries to read it:
    //  it will load the doc from redis again
    else {
      const doc = this.getDoc(name).setIsLoaded(false);
      this.setDoc(name, doc);
    }
  }

  /**
   * Checks if the store has any documents changed (dirty)
   * @returns {Boolean}
   */
  hasDirties() {
    return Array.from(this.data.values).some(obj => obj.getDirty());
  }

  /**
   * Saves all changed documents
   * @returns {Promise<>}
   */
  saveDirties() {
    const promises = Array.from(this.data.values)
      .filter(obj => obj.getDirty())
      .map(obj => {
        return this.saveDoc(obj.getName());
      });

    return Promise.allSettled(promises);
  }
}

export default Store;
