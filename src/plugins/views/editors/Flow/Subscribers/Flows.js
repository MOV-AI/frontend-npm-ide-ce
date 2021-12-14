import { MasterDB, Document } from "@mov-ai/mov-fe-lib-core";
import _set from "lodash/set";
import _merge from "lodash/merge";
import _omit from "lodash/omit";
import _debounce from "lodash/debounce";
import { Subject, BehaviorSubject } from "rxjs";
import { flattenObject } from "../../_shared/Utils/Utils";
import MasterComponent from "../../MasterComponent/MasterComponent";

/**
 * singleton representing a list of flows
 */
export default class FlowsDB {
  constructor() {
    if (FlowsDB.instance) return FlowsDB.instance;

    this.db_states = Object.freeze({ error: -1, loading: 0, ready: 1 });

    FlowsDB.instance = this;

    this.patterns = [
      {
        Scope: "Flow",
        Name: "*",
        ExposedPorts: "*"
      },
      {
        Scope: "Flow",
        Name: "*",
        Parameter: "*"
      },
      {
        Scope: "Flow",
        Name: "*",
        Label: "*"
      },
      {
        Scope: "Flow",
        Name: "*",
        NodeInst: "*"
      },
      {
        Scope: "Flow",
        Name: "*",
        Container: "*"
      }
    ];

    // Flows
    this._flows = new Map();

    // Flow -> node; State Machine -> state
    this.db_types = Object.freeze({ node: this._flows });

    // state of the instance
    this._db_state = this.db_states.loading;

    this.state_sub = new BehaviorSubject(0);
    this.updates_sub = new Subject();

    this._initialize();
  }

  _initialize = () => {
    this.patterns.forEach(pattern => {
      MasterDB.subscribe(
        pattern,
        // only subscribing to updates
        data => this.onDataChange(data),
        // data => this.onDataLoad(data) deprecated; not using the subscriber to load the flows
        data => {}
      );
    });
    this.db_state = this.db_states.ready;

    return this;
  };

  destroy = () => {
    this.patterns.forEach(pattern => {
      MasterDB.unsubscribe(this.pattern);
    });
  };

  /**
   * Clear cached flows
   */
  clear = () => {
    this._flows.clear();
  };

  /**
   * getters and setters
   */

  addFlow = (key, value) => {
    this._flows.set(key, value);
  };

  removeFlow = key => {
    this._flows.delete(key);
  };

  set db_state(value) {
    if (value !== this._db_state) {
      this._db_state = value;
      this.state_sub.next(value);
    }
  }

  get flows() {
    return this._flows;
  }

  get state() {
    return this._db_state;
  }

  updateCache = (flowId, key, value) => {
    const updatedFlow = this.getFlow(flowId);
    if (updatedFlow) updatedFlow[key] = value;
    this.setFlow(flowId, updatedFlow);
  };

  getFlow = id => {
    return this._flows.get(id);
  };

  /**
   * async get flow from cache or load it
   */
  agetFlow = async id => {
    return this._flows.has(id) ? [this.getFlow(id)] : await this.loadFlow(id);
  };

  /**
   * Reload flow to update cache
   */
  reloadFlow = _debounce(flow_id => {
    this.loadFlow(flow_id);
  }, 500);

  /**
   * loadFlow - load flow and subflows from the server
   *
   * @param {String} path path of the document
   */
  loadFlow = path => {
    const args = Document.parsePath(path, "Flow");

    // Document instance
    const tpl = new Document(
      {
        ...args
      },
      "v2"
    );

    return tpl
      .read()
      .then(async res => {
        if (!res?.Flow?.[tpl.name]) {
          return this.removeFlow(path);
        }
        const toSave = { ...res.Flow[tpl.name], url: path };
        this.addFlow(path, toSave);

        return { id: path, value: toSave };
      })
      .then(data => {
        if (data) {
          return Promise.all(
            [data].concat(this.getSubFlows(data.value, path))
          ).then(() => [data]);
        }
      })
      .catch(error => {
        console.warn("Failed to get Node. ", error);
        MasterComponent.alert(
          "Failed to get Node",
          MasterComponent.ALERTS.warning
        );
      });
  };

  /**
   * request sub flows and cache them
   *
   * @param {Object} flow a flow object
   */
  getSubFlows = flow => {
    const requests = [];

    try {
      Object.keys(flow.Container || {}).forEach(container => {
        const subFlowName = flow.Container[container].ContainerFlow;

        requests.push(this.agetFlow(subFlowName));
      });
    } catch (error) {
      console.error(error);
    }

    return requests;
  };

  setFlow = (id, value) => {
    return this._flows.set(id, value).get(id);
  };

  /**
   * handlers
   */

  onStateChange = fn => {
    return this.state_sub.subscribe(fn);
  };

  onUpdate = fn => {
    return this.updates_sub.subscribe(fn);
  };

  /**
   * Deprecated
   */
  onDataLoad = _data => {
    const data = _data.value.Flow || {};
    this._onUpdate(data);
    this.db_state = this.db_states.ready;
  };

  onDataChange = _data => {
    const data = _data.key.Flow || {};
    const flows = this._onUpdate(data, _data.event);
    flows.forEach(flow_id => this.updates_sub.next(flow_id));
  };

  _onUpdate = (data, event) => {
    const flows = Object.keys(data).map(flow_id => {
      const { path } = Document.parsePath(flow_id, "Flow");

      const curr_flow =
        this.getFlow(flow_id) || this.setFlow(flow_id, { url: path });

      // call event
      (this[event] || this.default)(flow_id, curr_flow, data);
      if (event === "del") this.reloadFlow(flow_id);
      return flow_id;
    });
    return flows;
  };

  /**
   * hset - handle data changes with event hset
   */
  get hset() {
    return this.hash;
  }

  /**
   * hdel - handle data changes with event hdel
   */
  get hdel() {
    return this.hash;
  }

  /**
   * hash - handle data changes with events hset and hdel
   */
  get hash() {
    return (flow_id, curr_flow, data) => {
      const obj = data[flow_id];

      // default fn
      const _default = (curr_flow, key, obj) => _set(curr_flow, key, obj[key]);

      Object.keys(obj).forEach(key => {
        (this[key] || _default)(curr_flow, key, obj);
      });
    };
  }

  get Container() {
    return (curr_flow, key, obj) => _merge(curr_flow[key], obj[key]);
  }

  /**
   * del - handle data changes with event del
   */
  get del() {
    return (flow_id, curr_flow, data) => {
      const path = Object.keys(flattenObject(data[flow_id]))[0];
      this.setFlow(flow_id, _omit(curr_flow, path));
    };
  }

  /**
   * default - default handle for data changes
   */
  get default() {
    return (flow_id, curr_flow, data) => {
      _merge(curr_flow, data[flow_id]);
    };
  }

  /**
   * Returns true if the name represents a NodeInst and false
   * if it represents a Container (aka sub flow)
   * A container will always have '__' for ex.: name1__name2__nodeInst1
   *
   * @param {String} nodeName node instance name
   */
  isNodeInst = nodeName => {
    return nodeName.split("__").length <= 1;
  };

  /**
   * Return the template of the node instance.
   * The node instance can be in the main flow or in a subflow
   *
   * @param {String} flowName the name of the main flow
   * @param {String} nodeInstName the name of the node instance
   *
   * @returns {String} the template name (Node)
   */
  getNodeTemplate = (flowName, nodeName) => {
    try {
      const flow = this.getFlow(flowName);

      if (!flow) throw new Error(`Flow "${flowName}" does not exist.`);

      if (this.isNodeInst(nodeName) === true) {
        const nodeInst = flow.NodeInst[nodeName];

        if (!nodeInst)
          throw new Error(
            `Node instance "${nodeName}" does not exist in flow "${flowName}".`
          );

        // return the nodeInst Template
        return nodeInst.Template;
      } else {
        // it is a container, we need to go down to the subflow
        // to search for the nodeInst
        const [containerName, ...subNodeName] = nodeName.split("__");

        const subFlowName = flow.Container[containerName].ContainerFlow;

        return this.getNodeTemplate(subFlowName, subNodeName.join("__"));
      }
    } catch (error) {
      const errorMsg = `Could not find the template of the node instance "${nodeName}"`;
      console.error(`${errorMsg}; \n${error}`);
    }
  };
}
