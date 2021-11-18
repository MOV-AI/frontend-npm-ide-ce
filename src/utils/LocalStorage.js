class LocalStorage {
  constructor() {
    if (instance) return instance;
    instance = this;
  }

  set(key, value) {
    console.log("debug setting key", key, value);
    localStorage[key] = JSON.stringify(value);
    return this;
  }

  get(key, defaultValue) {
    if (key in localStorage) {
      return JSON.parse(localStorage[key]);
    }
    return defaultValue;
  }

  hasKey(key) {
    return key in localStorage;
  }

  keys() {
    return Object.keys(localStorage);
  }

  static getInstance() {
    return new LocalStorage();
  }

  static set(key, value) {
    return LocalStorage.getInstance().set(key, value);
  }

  static get(key) {
    return LocalStorage.getInstance().get(key);
  }

  static hasKey(key) {
    return LocalStorage.getInstance().hasKey(key);
  }

  static keys() {
    return LocalStorage.getInstance().keys();
  }
}

let instance = null;

export default LocalStorage;
