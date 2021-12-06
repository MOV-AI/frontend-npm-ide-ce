const symbols = {
  timer: Symbol(),
  callbacks: Symbol()
};

class Observable {
  constructor() {
    this[symbols.timer] = undefined;

    /**
     * Proxy to trap changes to the properties
     */
    return new Proxy(this, {
      set(target, prop, value) {
        // check if the property should be trapped
        if (target.observables.includes(prop)) {
          // set the property
          const res = Reflect.set(...arguments);

          // dispatch update
          target.dispatch(prop, value, target[symbols.callbacks].values());

          return res;
        }

        // default
        return Reflect.set(...arguments);
      }
    });
  }

  // List of porpeties to observe
  observables = [];

  // List of callbacks to execute on update
  [symbols.callbacks] = new Map();

  /**
   * Subscribe to updates
   * @param {function} callback : The function to run
   * @returns {symbol} : The id of the subscription used to unsubscribe
   */
  subscribe(callback) {
    const id = Symbol();
    this[symbols.callbacks].set(id, callback);
    return id;
  }

  /**
   * Unsubscribe from updates
   * @param {symbol} id : The id returned when subscribing
   * @returns {boolean} : true if an element in the Map object existed and has been removed, or false if the element does not exist.
   */
  unsubscribe(id) {
    return this[symbols.callbacks].delete(id);
  }

  /**
   * Execute callbacks from subscribers
   * @param {string} prop : The name of the changing property
   * @param {any} value : The value of the property
   * @returns  {any}
   */
  dispatch(prop, value, callbacks) {
    try {
      for (const fn of callbacks) {
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
    this[symbols.callbacks].clear();
  }
}

export default Observable;
