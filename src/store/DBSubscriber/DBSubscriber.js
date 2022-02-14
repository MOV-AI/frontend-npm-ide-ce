import { StoreAbstractPlugin } from "../plugins";
import Subscriber from "../../subscriber/Subscriber";
import _isEqual from "lodash/isEqual";

const symbols = {
  timer: Symbol(),
  subscribers: Symbol()
};

// debounce updates (in milliseconds)
const DEBOUNCE_TIME = 100;

/**
 * Class providing a subscriptions manager for the documents
 * To be used as a plugin of the Store
 * @param {object} : Store instance
 */
class DBSubscriber extends StoreAbstractPlugin {
  constructor(iStore) {
    super();
    this.iStore = iStore;
  }

  name = "DBSubscriber";
  [symbols.timer] = null;
  [symbols.subscribers] = new Map();

  get scope() {
    return this.iStore.scope;
  }

  subscribe(docName) {
    const subscriber = new Subscriber({
      pattern: this.getPattern(docName)
    });

    subscriber.subscribe(
      data => this.onUpdate(data),
      data => this.onLoad(data)
    );

    // add the subscriber to the map
    this[symbols.subscribers].set(this.generateId(docName), subscriber);
  }

  unsubscribe(docName) {
    const id = this.generateId(docName);

    this[symbols.subscribers].get(id).destroy();
    this[symbols.subscribers].delete(id);
  }

  getPattern(docName) {
    const { scope } = this;
    return { Scope: scope, Name: docName, LastUpdate: "*" };
  }

  /**
   * Generates an id based on the inputs
   * @param {string} docName
   * @returns {string}
   */
  generateId(docName) {
    return `${this.scope}/${docName}`;
  }

  getDoc(name) {
    return this.iStore.getDoc(name);
  }

  onLoad(data) {
    // not in use
  }

  /**
   * Debouces the notifications from the subscriber
   * @param {object} data : New data received from the subscriber
   */
  onUpdate(data) {
    clearTimeout(this[symbols.timer]);

    this[symbols.timer] = setTimeout(
      () => this.updateDocument(data.patterns[0].Name),
      DEBOUNCE_TIME
    );
  }

  /**
   * Updates the document if needed
   */
  updateDocument(docName) {
    this.iStore
      .fetchDoc(docName)
      .then(updatedData => {
        // get the document instance from the store
        const doc = this.getDoc(docName);

        // serialize model data
        const currentData = doc.serializeToDB();

        // remove keys not to be considered
        const { _schema_version, ...filteredData } = updatedData;

        if (this.shouldUpdate(currentData, filteredData)) {
          // getDirty is true:
          //    local document already has changes thus only set outdated flag to true
          //
          // getDirty is false:
          //    can overwrite because the local document was not changed

          doc.getDirty()
            ? doc.setOutdated(true)
            : this.overwriteDoc(docName, filteredData);
        }
      })
      .catch(error => console.log(error));
  }

  /**
   * Compares the given objects
   * @param {object} objOne : Object to compare
   * @param {object} objTwo : Object to compare
   * @returns {boolean} : True if objects are different
   */
  shouldUpdate(objOne, objTwo) {
    return !_isEqual(objOne, objTwo);
  }

  /**
   * Overwrites the document data
   * @param {object} data The data to overwrite the document
   */
  overwriteDoc(docName, data) {
    const doc = this.getDoc(docName);

    // Get the static method
    const serialized = doc.constructor.serializeOfDB(data);

    // Update data in data model
    doc.setData(serialized).setDirty(false);

    // Emit event to Doc Manager
    this.iStore.docManager?.onDocumentUpdate(doc);
  }

  /**
   * Clean up
   */
  destroy() {
    for (const i of this[symbols.subscribers].values()) {
      i.unsubscribe();
    }
    this[symbols.subscribers].clear();
  }
}

export default DBSubscriber;
