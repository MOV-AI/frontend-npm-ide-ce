import EVENTS from "./events";

/**
 * Class to manage a list of items of a specific model
 */
class Manager {
  /**
   *
   * @param {string} propName : The property name in the parent model
   * @param {class} model : The model to manage
   * @param {object} events : An object with events and associated subscribers
   */
  constructor(propName, model, events) {
    // events {object} : {<event name>: <callback>}
    // Available events  (method -> event):
    //   setItem -> onCreate
    //   updateItem -> onUpdate
    //   deleteItem -> onDelete
    this.events = events ?? {};

    // The name of the property to manage
    this.propName = propName;

    // The model of the items
    this.model = model;
  }

  /**
   * Key:value store to save the items
   */
  data = new Map();

  //========================================================================================
  /*                                                                                      *
   *                                     Data handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Checks if the item exists
   * @param {string} name : The name of the item
   * @returns {boolean} : True if the item exists otherwise false
   */
  checkExists(name) {
    return this.data.has(name);
  }

  /**
   * Returns an item based on a name
   * @param {string} name : The name of the item
   * @returns {object} : The value of the item or undefined
   */
  getItem(name) {
    return this.data.get(name);
  }

  /**
   * Creates a new item
   * Emits the CREATE event
   * @param {object} param0 : An object with the name of the item and the content
   * @returns {object} : The instance
   */
  setItem({ name, content }) {
    const obj = new this.model();

    obj.setData({ name, ...content });

    this.data.set(name, obj);

    //subscribe to object changes to emit update event
    obj.subscribe(() => {
      this.emit(EVENTS.UPDATE);
    });

    this.emit(EVENTS.CREATE);

    return this;
  }

  /**
   * Updates an item
   * @param {object} param0 : An object with the name of the item and the content
   * @returns {object} : The instance
   */
  updateItem({ name, content }) {
    this.getItem(name)?.setData(content);

    this.emit(EVENTS.UPDATE);

    return this;
  }

  /**
   * Deletes an item
   * @param {string} key : The name of the item
   * @returns {boolean} : True on success, false otherwise
   */
  deleteItem(name) {
    this.getItem(name)?.destroy();

    const res = this.data.delete(name);

    this.emit(EVENTS.DELETE);

    return res;
  }

  /**
   * Creates one or more items
   * @param {object} json : An object with the items to create
   * @returns {object} : The instance
   */
  setData(json) {
    Object.entries(json ?? {}).forEach(([name, content]) => {
      this.setItem({ name, content });
    });

    return this;
  }

  //========================================================================================
  /*                                                                                      *
   *                                      Serializers                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns all items serialized
   * @returns {object} : An object with all items serialized
   */
  serialize() {
    const output = {};

    for (const key of this.data.keys()) {
      const obj = this.getItem(key);

      output[obj.getName()] = obj.serialize();
    }

    return output;
  }

  /**
   * Returns all items serialized for database insertion
   * @returns {object} : An object with all items serialized
   */
  serializeToDB() {
    const output = {};

    for (const key of this.data.keys()) {
      const obj = this.getItem(key);

      output[obj.getName()] = obj.serializeToDB();
    }

    return output;
  }

  /**
   * Returns an object serialized for the model insertion
   * @param {object} json : An object with all the items serialized from db
   * @returns {object} : An object with all items serialized
   */
  static serializeOfDB(json, model) {
    const output = {};

    Object.entries(json ?? {}).forEach(([key, content]) => {
      output[key] = model.serializeOfDB({ [key]: { ...content } });
    });

    return output;
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Events Handlers                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private
   * Calls subscribers based on the event received
   * @param {string} event : The event name
   */
  emit(event) {
    const { propName: name } = this;
    const value = this.serialize();

    // Execute on specific event
    const fn = this.events[event];

    if (typeof fn === "function") {
      fn.call(this, event, name, value);
    }

    // Execute for any of the events
    const anyFn = this.events[EVENTS.ANY];

    if (typeof anyFn === "function") {
      anyFn.call(this, event, name, value);
    }
  }

  /**
   * Destroy items
   */
  destroy() {
    Array.from(this.data.values()).destroy();
    this.data.clear();
  }
}

export default Manager;
