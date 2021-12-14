import _get from "lodash/get";
import { MasterDB } from "@mov-ai/mov-fe-lib-core";

export default class FlowSubscriber {
  constructor(uid, mInterface, graph, component, model) {
    this.uid = uid;
    this.mInterface = mInterface;
    this.graph = graph;
    this.component = component;
    this.database = MasterDB;
    this.model = model || "Flow";

    this.params = {
      Scope: this.model,
      Name: this.uid
    };

    this.destroyed = false;
    // this.id = Math.random();

    this._initialize();
  }

  _initialize = () => {
    // initialize the subscriber
    this.database.subscribe(
      this.params,
      data => {
        this._update(data);
      },
      data => {}
    );
  };

  destroy = () => {
    this.destroyed = true;
    this._unsubscribe();
    this.mInterface = null;
    this.graph = null;
    this.component = null;
    this.database = null;
  };

  _unsubscribe = () => {
    this.database.unsubscribe(this.params);
  };

  _update = data => {
    // enabling this log (and this.id) it's possible to perceive that
    // the method is still triggered after unsubscribing
    // FIXME fix WSSub in mov-fe-lib-core
    // console.log(
    //   `??? ${this.id} flowsubscriber ${this.model} _update destroyed:${this.destroyed}`,
    //   data
    // );
    if (this.destroyed) return;
    const obj = data.key[this.model][this.uid];
    //get hdel hset del set or default fn
    (this[data.event] || this.default)(obj);
  };

  get hdel() {
    return flow => {
      Object.keys(flow).forEach(key => {
        const obj = _get(flow, key, {});
        (this[key] || this.notImplemented)("hdel", obj);
      });
    };
  }

  get hset() {
    return flow => {
      Object.keys(flow).forEach(key => {
        const obj = _get(flow, key, {});
        (this[key] || this.notImplemented)("hset", obj);
      });
    };
  }

  get del() {
    return flow => {
      Object.keys(flow).forEach(key => {
        const obj = _get(flow, key, {});
        (this[key] || this.notImplemented)("del", obj);
      });
    };
  }

  get set() {
    return flow => {
      Object.keys(flow).forEach(key => {
        const obj = _get(flow, key, {});
        (this[key] || this.notImplemented)("set", obj);
      });
    };
  }

  /**
   * Catch not implemented events
   */
  get default() {
    return (event, flow) => {
      console.log(event, " - Event not implemented");
    };
  }

  updateNode = (event, obj, _type = "NodeInst") => {
    Object.keys(obj).forEach(node_id => {
      const data = obj[node_id] || {};
      this.graph.updateNode(event, node_id, data, _type);
    });
  };

  /**
   *  Function to update NodeInst
   */
  get NodeInst() {
    return (event, obj) => this.updateNode(event, obj);
  }

  /**
   *  Function to update Container
   */
  get Container() {
    return (event, obj) => this.updateNode(event, obj, "Container");
  }

  /**
   *  Function to update State
   */
  get State() {
    return (event, obj) => this.updateNode(event, obj, "State");
  }

  get Links() {
    const actions = {
      hset: () => this.addLinks(),
      hdel: () => this.deleteLinks()
    };
    return (event, obj) => {
      const fn = _get(
        actions,
        event,
        () =>
          function () {
            console.debug("Event ignored", event);
          }
      );
      fn()(obj);
    };
  }

  addLinks = () => {
    return obj => {
      Object.keys(obj).forEach(link_id => {
        this.graph.addLink(
          {
            name: link_id,
            ...obj[link_id]
          },
          this.uid
        );
      });
      this.graph.validateFlow();
    };
  };

  deleteLinks = () => {
    return obj => {
      this.graph.deleteLinks(Object.keys(obj || {}), this.uid);
      this.graph.validateFlow();
    };
  };

  get Parameter() {
    return (event, obj) => {
      if (event === "del") {
        const params = this.mInterface.document.Parameter;
        Object.keys(obj).forEach(key => {
          delete params[key];
        });
        this.component.onDocChange("Parameter", params);
      } else {
        let params = this.mInterface.document.Parameter;
        Object.keys(obj).forEach(key => {
          const prev_value = _get(
            this.mInterface.document,
            `Parameter.${key}`,
            {}
          );
          params = {
            ...params,
            [key]: { ...prev_value, ...obj[key] }
          };
        });
        this.component.onDocChange("Parameter", params);
      }
    };
  }

  get Label() {
    return (event, label) => {
      // on del event the document was deleted or restored
      if (label === "" && event === "del") {
        this.destroyed = true;
        this.component.setState({ loading: true });
        this.mInterface.setMode("loading");
        setTimeout(() => this.mInterface.reload(), 2500);
      }
    };
  }

  get User() {
    return (event, value) => {
      this.component.onDocChange("User", value);
    };
  }

  get LastUpdate() {
    return (event, value) => {
      this.component.onDocChange("LastUpdate", value);
    };
  }

  get Description() {
    return (event, value) => {
      this.component.onDocChange("Description", value);
    };
  }

  get ExposedPorts() {
    return (event, obj) => {
      const exposedPorts = [undefined, null, ""].includes(obj) ? {} : obj;
      this.graph.updateExposedPorts(exposedPorts);
      this.component.onDocChange("ExposedPorts", exposedPorts);
    };
  }

  get Layers() {
    return (event, obj) => {
      this.component.onDocChange("Layers", obj);
    };
  }

  /**
   * Catch not implemented updates
   */
  get notImplemented() {
    return (event, obj) => {};
  }
}
