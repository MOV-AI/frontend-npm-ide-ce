class Clipboard {
  constructor() {
    if (Clipboard.instance) return Clipboard.instance;
    Clipboard.instance = this;
    this._data = {};
  }

  /**
   * Get clipboard data
   */
  get data() {
    return this._data;
  }

  /**
   * Write key data in clipboard
   * @param {string} key : Key name
   * @param {*} value : Key Value
   */
  write(key, value) {
    this._data[key] = value;
  }

  /**
   * Read clipboard key
   * @param {string} key
   * @returns {*} Clipboard key data value
   */
  read(key) {
    return this.data[key];
  }
}

const KEYS = {
  NODES_TO_COPY: "NodesToCopy"
};

export default Clipboard;
export { KEYS };
