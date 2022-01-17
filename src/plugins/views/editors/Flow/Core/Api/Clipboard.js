/**
 * Clipboard singleton
 */

export class Clipboard {
  constructor() {
    if (Clipboard.instance) return Clipboard.instance;
    Clipboard.instance = this;
    this._data = {};
  }

  /**
   *  get clipboard data
   */
  get data() {
    return this._data;
  }

  /**
   *
   * @param {string} key base key to clear
   */
  clear(key) {
    if (key) delete this._data[key];
  }

  /**
   *
   * @param {string} key base key to read
   */
  static read(key) {
    const inst = new Clipboard();
    return key ? inst.data[key] || {} : inst.data;
  }

  /**
   *
   * @param {string} key base key to write
   * @param {any} value object, primitive, etc, to write
   */
  static write(key, value) {
    return (new Clipboard()._data[key] = value);
  }
}
