import _omit from "lodash/omit";
import _set from "lodash/set";
import _get from "lodash/get";
import _merge from "lodash/merge";
import _debounce from "lodash/debounce";
import { Subject, BehaviorSubject } from "rxjs";
import { flattenObject } from "../../Utils/utils";
import { MasterDB, Document } from "@mov-ai/mov-fe-lib-core";

export class NodesDB {
  constructor() {
    if (NodesDB.instance) return NodesDB.instance;

    this.db_states = Object.freeze({ error: -1, loading: 0, ready: 1 });

    NodesDB.instance = this;

    this.model = "Node";

    // Load all nodes
    this.pattern = {
      Scope: this.model,
      Name: "*"
    };

    // Nodes for the Flow
    this._nodes = new Map();
    // Nodes for the State Machine
    this._states = new Map();
    // Flow -> node; State Machine -> state
    this.db_types = Object.freeze({ node: this._nodes, state: this._states });

    // state of the instance
    this._db_state = this.db_states.loading;

    this.state_sub = new BehaviorSubject(0);
    this.updates_sub = new Subject();

    this._initialize();
  }

  _initialize = () => {
    MasterDB.subscribe(
      this.pattern,
      data => this.onDataChange(data),
      data => this.onDataLoad(data)
    );

    return this;
  };

  destroy = () => {
    MasterDB.unsubscribe(this.pattern);
  };

  /**
   * getters and setters
   */

  addNode = (key, value) => {
    const db_data = key.includes("@SM")
      ? this.db_types.state
      : this.db_types.node;
    db_data.set(key, value);
    return db_data.get(key);
  };

  removeNode = key => {
    const db_data = key.includes("@SM")
      ? this.db_types.state
      : this.db_types.node;
    db_data.delete(key);
  };

  set db_state(value) {
    if (value !== this._db_state) {
      this._db_state = value;
      this.state_sub.next(value);
    }
  }

  get nodes() {
    return this._nodes;
  }

  get states() {
    return this._states;
  }

  /**
   * getTemplate - get Node data
   * @param {string} type template type (node|state)
   * @param {string} name node template name
   */
  getTemplate = (_type, name) => {
    return _type in this.db_types ? this.db_types[_type].get(name) : undefined;
  };

  /**
   * async get node template from cache or load it
   */
  agetTemplate = async (_type, name) => {
    if (!name) return;
    return this.db_types[_type].has(name)
      ? this.getTemplate(_type, name)
      : await this.loadTemplate(name);
  };

  /**
   * Reload node to update cache
   */
  reloadTemplate = _debounce(node_id => {
    this.loadTemplate(node_id).then(() => this.updates_sub.next(node_id));
  }, 500);

  /**
   * loadTemplate - load node template from the server
   *
   * @param {String} path path of the document
   */
  loadTemplate = path => {
    const args = Document.parsePath(path, this.model);

    // Document instance
    const tpl = new Document(
      {
        ...args
      },
      "v2"
    );

    return tpl
      .read()
      .then(res => {
        if (!res?.Node?.[tpl.name]) {
          return this.removeNode(path);
        }
        const toSave = {
          id: tpl.name,
          name: tpl.name,
          template: { ...res.Node[tpl.name] },
          url: path
        };
        this.addNode(path, toSave);

        return { ...toSave };
      })
      .catch(error => {
        console.warn("Failed to get Node: ", path, args, error);
        return;
      });
  };

  getFromTemplates = name => {
    let template = undefined;
    [this._nodes, this._states].some(objs => {
      template = objs.get(name);
      return Boolean(template);
    });
    return template;
  };

  /**
   * getPort - get PortsInst data
   * @param {string} node_name node template name
   * @param {string} port_name PortsInst name
   *
   * @returns {object} PortsInst
   */
  getPort = (node_name, port_name) => {
    const node = this.getTemplate("node", node_name);
    const port = _get(node, `template.PortsInst.${port_name}`, null);

    // hack bc most of the ports do not have PortsLabel and currently PortsLabel value is equal to the name
    if (port) _set(port, "PortsLabel", port_name);

    return port;
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

  onDataLoad = data => {
    Object.keys(data.value.Node).forEach(key => {
      const { name, path } = Document.parsePath(key, this.model);
      this.addNode(key, {
        name: name,
        template: data.value.Node[key],
        id: key,
        url: path
      });
    });
    this.db_state = this.db_states.ready;
  };

  onDataChange = data => {
    const obj = _get(data, `key.${this.model}`, {});

    Object.keys(obj).forEach(key => {
      const { name, path } = Document.parsePath(key, this.model);
      const node =
        this.getFromTemplates(key) ||
        this.addNode(key, {
          name: name,
          template: {},
          id: key,
          url: path
        });
      if (data.event === "del") {
        const path = Object.keys(flattenObject(obj[key]))[0];
        node.template = _omit(node.template, path);
        this.reloadTemplate(key);
      } else {
        _merge(node.template, obj[key]);
      }
      this.updates_sub.next(key);
    });
  };
}
