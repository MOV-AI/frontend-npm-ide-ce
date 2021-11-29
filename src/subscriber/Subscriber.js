import { MasterDB } from "@mov-ai/mov-fe-lib-core";

class Subscriber {
  constructor({ pattern, onLoad, onUpdate }) {
    this.pattern = pattern;
    this.onLoad = onLoad;
    this.onUpdate = onUpdate;
    this.callbacks = { onLoad, onUpdate };
  }

  subscribe(onUpdate, onLoad) {
    console.log("going to subscribe", this);
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
