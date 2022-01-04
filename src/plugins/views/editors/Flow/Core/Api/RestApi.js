import _cloneDeep from "lodash/cloneDeep";
import _set from "lodash/set";
import _get from "lodash/get";
// import MasterComponent from "../../../MasterComponent/MasterComponent";
import { MasterDB, Document, Rest } from "@mov-ai/mov-fe-lib-core";
import { Clipboard } from "../../toRemove/api/Clipboard";
import { messages } from "./Messages";

export default class RestApi {
  constructor(uid, type, model = "Flow") {
    this.uid = uid;
    this.type = type;
    this.extension = ".flo";
    this.dataModel = model || "Flow";
    //this.nodeInstLbl = "NodeInst";
    //this.containerLbl = "Container";
    this.default_cf = "backend.FlowAPI"; // default cloud function
    this.db = MasterDB;
    this.messages = messages();
    this._clipboard = {};
  }

  get clipboard() {
    return Clipboard.read(this.type);
  }

  set clipboard(value) {
    Clipboard.write(this.type, value);
  }

  _callCloudFunction(args, fn, message, cloudFn = this.default_cf) {
    Rest.cloudFunction({
      cbName: cloudFn,
      func: fn,
      args
    }).then(res => {
      if (res.success === false) {
        const errorMsg = res.error ? res.error : res.statusText;
        // MasterComponent.alert(errorMsg, "error");
      } else {
        // MasterComponent.alert(message);
      }
    });
  }

  /**
   * Add a new node to the flow
   * @param {object} data
   */
  addNewNode = data => {
    const key = {
      NodeInst: { NodeInst: { [data.node.NodeLabel]: data.node } },
      Container: { Container: { [data.node.ContainerLabel]: data.node } },
      State: { State: { [data.node.StateLabel]: data.node } }
    };

    const args = {
      type: this.dataModel,
      name: this.uid,
      version: "__UNVERSIONED__"
    };
    const doc = new Document(args, "v2");

    doc.update({ ...key[data.type] }).catch(error => console.log(error));
  };

  /**
   * Delete node
   * @param {obj} node {id, type}
   *
   */
  deleteNode = node => {
    // hack to be removed after reviewing callback backend.FlowApi
    const types = {
      NodeInst: "MovAI/State",
      Container: "MovAI/Flow",
      State: ""
    };
    const args = {
      scope: this.dataModel,
      flowId: this.uid,
      nodeId: node.id,
      nodeType: types[node.type]
    };

    this._callCloudFunction(
      args,
      "deleteNodeInst",
      this.messages[this.type].onDeleteSuccess[node.type]
    );
  };

  /**
   * Save node new position
   * @param {obj} data {nodeId, {Visualization}}
   *
   * setNodePos(scope, flowId, nodeId, data, nodeType="", **ignore):
   */
  setNodePosition = data => {
    const flow = {
      scope: this.dataModel,
      flowId: this.uid
    };
    // hack to be removed after reviewing the cb backend.flowapi

    const _data = { data: { args: { ...data, ...flow }, func: "setNodePos" } };
    MasterDB.execute(this.default_cf, _data, data => {});
  };

  copyNode = (name, position, nodeToCopy) => {
    const args = {
      scope: this.dataModel,
      orgFlow: nodeToCopy.flow,
      copyFlow: this.uid,
      copyName: name,
      orgName: nodeToCopy.node.id,
      orgType: nodeToCopy.node.type,
      copyPosX: position.x,
      copyPosY: position.y,
      copyParams: nodeToCopy.node.Parameter
    };

    this._callCloudFunction(
      args,
      "copyNodeInst",
      this.messages[this.type].onCopySuccess[nodeToCopy.node.type]
    );
  };

  /**
   * Reset clipboard
   */
  resetClipboard = () => {
    Clipboard.write(this.type, {});
  };

  //   LINKS API

  /**
   *
   * Delete link
   * @param {*} linkId: Integer
   * @param {*} retLambda: Function: res => {}
   */
  deleteLink = (linkId, retLambda = DEFAULT_DELETE_RET_FUNC) => {
    const args = {
      scope: this.dataModel,
      flowId: this.uid,
      linkId: linkId
    };
    Rest.cloudFunction({
      cbName: "backend.FlowAPI",
      func: "deleteLink",
      args
    }).then(retLambda);
  };

  /**
   * Add a new link
   */
  addLink = link => {
    const args = {
      scope: this.dataModel,
      flowId: this.uid,
      link: link
    };
    Rest.cloudFunction({
      cbName: "backend.FlowAPI",
      func: "addLink",
      args
    }).then(res => {
      if (res.success === false) {
        // MasterComponent.alert(res.error, "error");
      } else {
        // MasterComponent.alert(`Link successfully created.`);
      }
    });
  };

  toggleExposed = data => {
    try {
      const exposed_ports = _cloneDeep(data.exposedPorts);
      const node_name = data.port.node.data.id;
      const exposed_template_name = data.port.node.getExposedName(
        data.port.data.origin
      );
      const path = [exposed_template_name, node_name];

      _set(
        exposed_ports,
        path,
        this.updateExposedPorts(
          _get(exposed_ports, path, []),
          data.port.data.name,
          !data.port.data.exposed
        )
      );

      const new_exposed_ports = this.rmEmpties(exposed_ports);

      if (Object.keys(new_exposed_ports).length > 0) {
        MasterDB.post(
          this.dataModel,
          this.uid,
          { ExposedPorts: "*" },
          { ...new_exposed_ports },
          (data, res) =>
            RestApi.parseResponse(
              this.messages[this.type].onExposedPortsSuccess,
              data,
              res
            )
        );
      } else {
        MasterDB.delete(
          this.dataModel,
          this.uid,
          (data, res) =>
            RestApi.parseResponse(
              this.messages[this.type].onExposedPortsSuccess,
              data,
              res
            ),
          { ExposedPorts: "" }
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  updateExposedPorts = (ports, port_name, value) => {
    return value
      ? [...new Set([...ports, port_name])]
      : ports.filter(port => port !== port_name);
  };

  rmEmpties = _ports => {
    const ports = {};
    Object.keys(_ports).forEach(template => {
      const nodes = _ports[template];
      Object.keys(nodes).forEach(node => {
        const n_ports = nodes[node];
        if (n_ports.length > 0) _set(ports, [template, node], n_ports);
      });
    });
    return ports;
  };

  static parseResponse = (message, data, res) => {
    const defaultError = "Server could not be reached";
    let msgType = "success";
    let msg = message;

    if ((data?.success || false) === false) {
      msgType = "error";
      msg = res?.statusText || defaultError;
    }
    // MasterComponent.alert(msg, msgType);
  };

  /**
   * saveFlowDescription - save the description value of a flow
   * @param {string} flow_id flow id
   * @param {string} value description value
   */
  static saveFlowDescription(flow_id, value) {
    MasterDB.put("Flow", flow_id, { Description: value }, (data, res) =>
      RestApi.parseResponse(messages().flow.onSaveSuccess, data, res)
    );
  }

  /**
   * saveFlowParam create/update a flow parameter
   * @param {string} flow_id flow id
   * @param {object} param parameter to save {dataName: <value>, dataInfo: <value>, dataValue: <value>}
   */
  static saveFlowParam(flow_id, param, onSave = () => {}) {
    MasterDB.put(
      "Flow",
      flow_id,
      {
        Parameter: {
          [param.dataName]: {
            Value: param.dataValue,
            Description: param.dataInfo,
            Type: param.dataType
          }
        }
      },
      (data, res) => {
        if (data?.success) onSave();
        RestApi.parseResponse(messages().flow.onSaveSuccess, data, res);
      }
    );
  }

  /**
   * saveNodeInstParam create/update a flow parameter
   * @param {string} flowId flow id
   * @param {string} nodeInst node instance name
   * @param {object} param parameter to save {dataName: <value>, dataInfo: <value>, dataValue: <value>}
   * @param {object} type what was edited, either Parameter, CmdLine or EnvVar
   */
  static saveNodeInstParam(
    flowId,
    nodeInst,
    modal,
    type,
    message = messages().flow.onSaveSuccess
  ) {
    // If parameter value is empty then delete the param in the DB
    if (modal.dataValue === "") {
      MasterDB.delete("Flow", flowId, (data, res) => {}, {
        NodeInst: {
          [nodeInst]: {
            [type]: { [modal.dataName]: { Value: "", Type: "" } }
          }
        }
      });
    } else {
      MasterDB.post(
        "Flow",
        flowId, // name
        { NodeInst: { [nodeInst]: { [type]: modal.dataName } } }, // key
        { [modal.dataName]: { Value: modal.dataValue, Type: modal.dataType } }, // data
        (data, res) => {
          RestApi.parseResponse(message, data, res);
        }
      );
    }
  }

  /**
   * saveNodeInstInfo create/update a flow parameter
   * @param {string} flow_id flow id
   * @param {string} nodeInst node instance name
   * @param {object} data in either true or false
   * @param {object} type either Dummy or Permistent
   */
  static saveNodeInstInfo(flow_id, nodeInst, data, type) {
    // If user selected the empty option then delete the key in the DB
    if (data === "") {
      MasterDB.delete("Flow", flow_id, (data, res) => {}, {
        NodeInst: {
          [nodeInst]: {
            [type]: ""
          }
        }
      });
    } else {
      // convert slector value to boolean values, "true" -> true
      let value = undefined;
      try {
        value = JSON.parse(data);
      } catch (error) {}
      MasterDB.post(
        "Flow",
        flow_id, // name
        { NodeInst: { [nodeInst]: type } }, // key
        { [type]: value }, // data
        (data, res) => {
          RestApi.parseResponse(messages().flow.onSaveSuccess, data, res);
        }
      );
    }
  }

  /**
   * saveNodeInstLayers create/update a NodeLayers
   * @param {string} flow_id flow id
   * @param {string} nodeInst node instance name
   * @param {object} data in either true or false
   */
  static saveNodeInstLayers(flow_id, nodeInst, data) {
    MasterDB.put(
      "Flow",
      flow_id, // name
      {
        NodeInst: {
          [nodeInst]: {
            NodeLayers: data
          }
        }
      },
      (data, res) => {
        RestApi.parseResponse(messages().flow.onSaveSuccess, data, res);
      }
    );
  }

  /**
   * saveContainerParam create/update a flow parameter
   * @param {string} flow_id flow id
   * @param {string} container_id container id
   * @param {object} param parameter to save {dataName: <value>, dataInfo: <value>, dataValue: <value>}
   */
  static saveContainerParam(flow_id, container_id, param) {
    MasterDB.put(
      "Flow",
      flow_id,
      {
        Container: {
          [container_id]: {
            Parameter: {
              [param.dataName]: {
                Value: param.dataValue,
                Type: param.dataType
              }
            }
          }
        }
      },
      (data, res) =>
        RestApi.parseResponse(messages().flow.onSaveSuccess, data, res)
    );
  }

  /**
   * deleteFlowParam delete a flow parameter
   * @param {string} flow_id flow id
   * @param {object} param parameter to delete
   */
  static deleteFlowParam(flow_id, param, onDelete = () => {}) {
    MasterDB.delete(
      "Flow",
      flow_id,
      (data, res) => {
        if (data?.success) onDelete();
        RestApi.parseResponse(
          messages().flow.onDeleteSuccess.Global,
          data,
          res
        );
      },
      {
        Parameter: {
          [param]: "*"
        }
      }
    );
  }

  /**
   * deleteContainerParam delete a flow parameter
   * @param {string} flow_id flow id
   * @param {string} container_id container id
   * @param {object} param parameter to delete
   */
  static deleteContainerParam(
    flow_id,
    container_id,
    param,
    onDelete = () => {}
  ) {
    MasterDB.delete(
      "Flow",
      flow_id,
      (data, res) => {
        if (data?.success) onDelete();
        RestApi.parseResponse(
          messages().flow.onDeleteSuccess.Global,
          data,
          res
        );
      },
      {
        Container: {
          [container_id]: {
            Parameter: {
              [param]: "*"
            }
          }
        }
      }
    );
  }
}

const DEFAULT_DELETE_RET_FUNC = res => {
  if (res.success === false) {
    // MasterComponent.alert(res.error, "error");
  } else {
    // MasterComponent.alert(`Link successfully deleted.`);
  }
};
