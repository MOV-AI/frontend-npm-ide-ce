const symbols = {
  timer: Symbol(),
  enabled: Symbol()
};

/**
 * Provides observable capabilities
 * Implements a proxy trap to execute callbacks when
 * an observed property changes
 */
class Observable {
  constructor() {
    this[symbols.timer] = undefined;

    /**
     * Proxy to trap changes to the properties
     */
    return new Proxy(this, {
      set(target, prop, value) {
        // check if the property should be trapped
        if (target.observables.includes(prop) && target[symbols.enabled]) {
          // set the property
          const res = Reflect.set(...arguments);

          // dispatch update
          target.dispatch(prop, value);

          return res;
        }

        // default
        return Reflect.set(...arguments);
      }
    });
  }

  [symbols.enabled] = false;

  // List of porpeties to observe
  observables = [];

  // List of callbacks to execute on update
  subscribers = new Map();

  /**
   * Enable observables
   * @returns
   */
  enableObservables(enable = true) {
    this[symbols.enabled] = enable;
    return this;
  }

  /**
   * Subscribe to updates
   * @param {function} callback : The function to run
   * @returns {symbol} : The id of the subscription used to unsubscribe
   */
  subscribe(callback) {
    const id = Symbol();
    this.subscribers.set(id, callback);
    return id;
  }

  /**
   * Unsubscribe from updates
   * @param {symbol} id : The id returned when subscribing
   * @returns {boolean} : true if an element in the Map object existed and has been removed, or false if the element does not exist.
   */
  unsubscribe(id) {
    return this.subscribers.delete(id);
  }

  /**
   * Execute  subscribers
   * @param {string} prop : The name of the changing property
   * @param {any} value : The value of the property
   * @returns  {any}
   */
  dispatch(prop, value) {
    if (!this[symbols.enabled]) return;

    try {
      for (const fn of this.subscribers.values()) {
        setTimeout(() => fn.call(this, this, prop, value), 0);
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Clean up the instance
   */
  destroy() {
    this.subscribers.clear();
  }
}

export default Observable;
