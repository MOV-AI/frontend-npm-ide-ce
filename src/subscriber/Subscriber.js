import { MasterDB } from "@mov-ai/mov-fe-lib-core";

class Subscriber {
  constructor({ pattern, onLoad, onUpdate }) {
    this.pattern = pattern;
  }

  subscribe(onUpdate, onLoad) {
    MasterDB.subscribe(this.pattern, onUpdate, onLoad);
  }

  unsubscribe() {
    MasterDB.unsubscribe(this.pattern);
  }

  destroy() {
    this.unsubscribe();
  }
}

export default Subscriber;
