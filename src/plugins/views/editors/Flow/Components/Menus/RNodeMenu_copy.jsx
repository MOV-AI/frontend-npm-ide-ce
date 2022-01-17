import {
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Tooltip,
  Typography
} from "@material-ui/core";
import Select from "@material-ui/core/Select";
import { withStyles } from "@material-ui/core/styles";
import Layers from "@material-ui/icons/Layers";
import LayersClear from "@material-ui/icons/LayersClear";
import { Document } from "@mov-ai/mov-fe-lib-core";
import _get from "lodash/get";
import _isEqual from "lodash/isEqual";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import MasterComponent from "../../../MasterComponent/MasterComponent";
import ParamModal from "../../../NodeEditor/KeyValueTable/ParamModal/ParamModal2";
import CollapseItem from "../../../_shared/ListItems/CollapseItem";
import CollapseListManager from "../../../_shared/ListItems/CollapseListManager";
import { Item } from "../../../_shared/ListItems/Item";
import { mergeDeep } from "../../../_shared/Utils/Utils";
import RestApi from "../../Core/Api/RestApi";
import TableKeyValue from "./TableKeyValue";

// TO REMOVE
const MasterDB = {
  subscribe: () => {},
  unsubscribe: () => {}
};

const styles = theme => ({
  checkedLayer: {
    color: theme.palette.primary.main
  },
  layerRow: {
    display: "flex",
    flexDirection: "row"
  },
  layerItem: {
    flexGrow: 1,
    overflow: "hidden",
    padding: "10px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis"
  }
});

class RNodeMenu extends Component {
  state = {
    nodeTemplate: {},
    params: [],
    env: [],
    cmdline: [],
    layers: [],
    ports: [],
    persistent: "",
    launch: "",
    remappable: "",
    // priorityGroup: "",
    flow_layers: this.props._layers ? this.props._layers : {},
    paramModal: {
      open: false,
      data: { key: "", value: "", defaultValue: "", type: "", description: "" },
      type: "" //Parameter, CmdLine or EnvVar
    },
    nodeTemplateDoc: {
      workspace: "global",
      type: "Node",
      name: "",
      version: "-",
      data: {}
    }
  };

  subscribers_list = [];

  componentDidUpdate(prevProps) {
    const newProps = this.props;
    if (!_isEqual(newProps, prevProps)) {
      this.unsubscribe(); // Remove previous
      this.getNodeTemplate(); // Update right menu data
      this.subscribe(newProps);
    }
  }

  componentDidMount() {
    this.getNodeTemplate();
    this.subscribe(this.props);
  }

  componentWillUnmount() {
    //UNSUBSCRIBER
    this.unsubscribe();
  }

  getNodeTemplate = () => {
    const args = Document.parsePath(this.props.nodeInst.Template, "Node");
    const doc = new Document({ ...args }, "v2");
    let data = {};
    doc
      .read()
      .then(obj => {
        return _get(obj, `Node.${doc.name}`, {});
      })
      .then(data => this._parseNodeTemplate(data))
      .catch(error => console.error(error))
      .finally(() => {
        this.setState({ nodeTemplateDoc: { ...args, data } });
      });
  };

  getDataToSave = key => {
    const { t } = this.props;
    let list = {};
    // Do not mutate the state directly
    const stateObj = JSON.parse(JSON.stringify(this.state[key]));
    stateObj.forEach(obj => {
      if (obj.value === "") {
        list[obj.key] = {};
      } else {
        try {
          list[obj.key] = { Value: obj.value };
        } catch (error) {
          //TODO: Refactor this
          let errorMessage =
            `${t("Format Type Error")}\n` +
            `${t("In Parameter")}: ` +
            obj.key +
            ` , ${t("got the value")}: ` +
            obj.value +
            ` , ${t("and expected one of the following formats")}:\n` +
            `  Number:  .23\n` +
            `  Boolean:  true\n` +
            `  String:  "3D"\n` +
            `  Array:  [2,3]\n` +
            `  Object:  {"key1": "value", "key2": 23}\n` +
            `  NoneType:  null\n`;

          MasterComponent.confirmAlert(
            t("Invalid data type"),
            errorMessage,
            () => {},
            () => {},
            "",
            t("default"),
            t("Ok"),
            "primary",
            [],
            true,
            true
          );
        }
      }
    });
    return list;
  };

  unsubscribe = () => {
    this.subscribers_list.forEach(pattern => {
      MasterDB.unsubscribe(pattern);
    });
    this.subscribers_list = [];
  };

  subscribe = props => {
    //NODE INST
    const scopeFlow = {
      Scope: "Flow",
      Name: props.flowName,
      NodeInst: props.nodeInst.name
    };
    this.subscribers_list.push(scopeFlow);

    MasterDB.subscribe(
      scopeFlow,
      data => {
        this._cachemanagement(data);
      },
      data => {}
    );
  };

  _parseNodeTemplate = n_t => {
    const n_i = this.props.nodeInst;
    const flowLayers = this.props._layers;
    n_t["id"] = n_i.Template;

    const params = this._matchingObjs("Parameter", n_t, n_i);
    const env = this._matchingObjs("EnvVar", n_t, n_i);
    const cmdline = this._matchingObjs("CmdLine", n_t, n_i);
    const nodeLayers = n_i.NodeLayers.filter(layer => layer in flowLayers);

    this._setAttribute("persistent", n_i.Persistent);
    this._setAttribute("remappable", n_i.Remappable);
    this._setAttribute("launch", n_i.Launch);
    this._setAttribute("layers", nodeLayers, []);
    this._setAttribute("params", params, []);
    this._setAttribute("env", env, []);
    this._setAttribute("cmdline", cmdline, []);

    this._setPorts(n_t.PortsInst);

    this.setState({ nodeTemplate: n_t });
  };

  _setAttribute = (key, _value, _default = "") => {
    const value = _value === undefined ? _default : _value;
    this.setState({ [key]: value });
  };

  _setPorts = PortsInst => {
    const ports = [];

    Object.keys(PortsInst).forEach(key => {
      let portInst = PortsInst[key];
      //Looking for imports
      if (portInst.In !== undefined) {
        Object.keys(portInst.In).forEach(in_key => {
          let obj = {
            icon: "fas fa-sign-in-alt",
            key: in_key === "in" ? key : in_key + "@" + key,
            value:
              portInst.In[in_key].Callback !== undefined
                ? portInst.In[in_key].Callback
                : ""
          };

          if (portInst.In[in_key].Message === "movai_msgs/StateMachine") {
            obj["sm_id"] = portInst.In[in_key].Parameter.StateMachine;
          }

          ports.push(obj);
        });
      }

      if (portInst.Out !== undefined) {
        Object.keys(portInst.Out).forEach(out_key => {
          let obj = {
            icon: "fas fa-sign-out-alt",
            key: out_key === "out" ? key : out_key + "@" + key,
            value:
              portInst.Out[out_key].Callback !== undefined
                ? portInst.Out[out_key].Callback
                : ""
          };
          ports.push(obj);
        });
      }
    });

    this.setState({ ports });
  };

  state_cache = {};
  timer_updateCache = undefined;
  _cachemanagement = data => {
    this.state_cache = mergeDeep(this.state_cache, data.key);

    if (this.timer_updateCache !== undefined) {
      clearTimeout(this.timer_updateCache);
    }
    this.timer_updateCache = setTimeout(this._cacheUpdateState, 100);
  };

  _cacheUpdateState = () => {
    var obj =
      this.state_cache.Flow[this.props.flowName].NodeInst[
        this.props.nodeInst.name
      ];

    let persistent = _get(obj, "Persistent", this.state.persistent);
    let remappable = _get(obj, "Remappable", this.state.remappable);
    let launch = _get(obj, "Launch", this.state.launch);
    let layers = _get(obj, "NodeLayers", this.state.layers);
    let n_params = this._mergeWithState(
      "Parameter",
      obj,
      JSON.parse(JSON.stringify(this.state.params))
    );
    let n_env = this._mergeWithState("EnvVar", obj, this.state.env);
    let n_cmdline = this._mergeWithState("CmdLine", obj, this.state.cmdline);
    this.setState({
      params: [...n_params],
      env: [...n_env],
      cmdline: [...n_cmdline],
      persistent,
      remappable,
      launch,
      // priorityGroup,
      layers
    });
    this.state_cache = {};
    this.timer_updateCache = undefined;
  };

  _mergeWithState = (objKey, instance, list) => {
    if (instance && instance[objKey] !== undefined) {
      Object.keys(instance[objKey]).forEach(key => {
        let list_filter = list.filter(obj => obj.key === key);
        if (list_filter.length > 0) {
          list_filter[0].value = instance[objKey][key].Value;
        }
      });
    }

    return list;
  };

  _matchingObjs = (objKey, template, instance) => {
    //Get from the template
    let list = [];
    if (template[objKey] !== undefined) {
      Object.keys(template[objKey]).forEach(key => {
        let obj = {
          key: key,
          value: "",
          defaultValue: template[objKey][key].Value,
          description: template[objKey][key].Description,
          type: template[objKey][key].Type
        };
        list.push(obj);
      });

      //MATCHING WITH INSTANCE
      if (instance[objKey] !== undefined) {
        Object.keys(instance[objKey]).forEach(key => {
          let list_filter = list.filter(obj => obj.key === key);
          if (list_filter.length > 0) {
            list_filter[0].value = instance[objKey][key].Value;
          }
        });
      }
    }
    return list;
  };

  _onChangeKey = (key, obj) => {
    let list = JSON.parse(JSON.stringify(this.state[key]));
    const list_f = list.filter(o => obj.key === o.key);
    if (list_f.length > 0) {
      let newO = list_f[0];
      newO.value = obj.value;
    }
    let o = {};
    o[key] = list;
    this.setState({ ...o });
  };

  _onChangeLayers = (layer, checked) => {
    let layers = new Set(this.state.layers);
    checked === true ? layers.add(layer) : layers.delete(layer);
    RestApi.saveNodeInstLayers(this.props.flowName, this.props.nodeInst.name, [
      ...layers
    ]);
  };

  //========================================================================================
  /*                                                                                      *
   *                                    Modal Functions                                   *
   *                                                                                      */
  //========================================================================================

  handleParameterEditModal = (obj, type) => {
    const paramModal = JSON.parse(JSON.stringify(this.state.paramModal));
    paramModal.open = true;
    paramModal.data = { ...obj };
    paramModal.type = type;
    this.setState({ paramModal });
  };

  handleModalConfirm = values => {
    // Save NodeInst parameter/envars/cmdLine to redis
    RestApi.saveNodeInstParam(
      this.props.flowName,
      this.props.nodeInst.name,
      values,
      this.state.paramModal.type,
      values.message
    );
    // Close the modal
    this.setState({
      paramModal: {
        ...this.state.paramModal,
        open: false,
        data: { key: "", value: "" }
      }
    });
  };

  open = (menuObj, evt) => {
    const data = Document.parsePath(menuObj.name, "Callback");

    this.props.openDoc({ ...data, id: data.name, ctrlKey: evt.ctrlKey });
  };

  //========================================================================================
  /*                                                                                      *
   *                                        render                                        *
   *                                                                                      */
  //========================================================================================

  getLink = ({ id, workspace, type, name, version }) => {
    return (
      <Link
        component="button"
        onClick={event =>
          this.props.openDoc({
            id,
            workspace,
            type,
            name,
            version,
            ctrlKey: event.ctrlKey
          })
        }
      >
        {name}
      </Link>
    );
  };

  /**
   * Build the Details menu
   */
  getDetails = () => {
    const { t } = this.props;
    const { workspace, type, name, version, data } = this.state.nodeTemplateDoc;
    const { nodeTemplate } = this.state;

    const details = [
      { title: t("Workspace"), value: workspace },
      {
        title: t("Name"),
        value: this.getLink({ id: name, workspace, type, name, version })
      },
      {
        title: t("Version"),
        value: version === "__UNVERSIONED__" ? "-" : version
      },
      { title: t("Type"), value: _get(data, "Type", nodeTemplate.Type) } // TODO change for the template type
    ];

    return details.map((entry, index) => {
      return (
        <Typography
          key={"details-" + index}
          component="div"
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            paddingBottom: "8px"
          }}
        >
          <Typography
            component="div"
            style={{ paddingLeft: "8px", fontSize: "0.875rem" }}
          >
            {entry.title}
          </Typography>
          <Typography
            component="div"
            style={{
              flexGrow: 1,
              textAlign: "right"
            }}
          >
            {entry.value}
          </Typography>
        </Typography>
      );
    });
  };

  saveNodeInstInfo = (_value, key) => {
    // option is never selected with an empty string
    const value = _value === "default" ? "" : _value;

    RestApi.saveNodeInstInfo(
      this.props.flowName,
      this.props.nodeInst.name,
      value,
      key
    );
  };

  _getDefaultText = keyValue => {
    return keyValue ? "(default)" : "";
  };

  /**
   * Build the Properties menu
   */
  getProperties = (editable = true) => {
    const { saveNodeInstInfo, _getDefaultText } = this;
    const { t } = this.props;
    const { persistent, remappable, launch, nodeTemplate } = this.state;

    // define properties menu
    const properties = [
      {
        title: t("Persistent"),
        value: {
          template: nodeTemplate.Persistent,
          instance: persistent
        },
        onChange: evt => saveNodeInstInfo(evt.target.value, "Persistent"),
        options: [
          { text: t("Is persistent"), value: true },
          { text: t("Not persistent"), value: false }
        ]
      },
      {
        title: t("Remappable"),
        value: {
          template: nodeTemplate.Remappable,
          instance: remappable
        },
        onChange: evt => saveNodeInstInfo(evt.target.value, "Remappable"),
        options: [
          { text: t("Is remappable"), value: true },
          { text: t("Not remappable"), value: false }
        ]
      },
      {
        title: t("Launch"),
        value: {
          template: nodeTemplate.Launch,
          instance: launch
        },
        onChange: evt => saveNodeInstInfo(evt.target.value, "Launch"),
        options: [
          { text: t("To launch"), value: true },
          { text: t("Not to launch"), value: false }
        ]
      }
    ];

    return properties.map((item, index) => {
      const itemValue =
        typeof item.value.instance === "boolean"
          ? item.value.instance
          : item.value.template ?? false;
      return (
        <Grid
          key={"properties-item-" + index}
          item
          xs={12}
          style={{ textAlign: "left" }}
        >
          <FormControl fullWidth={true}>
            <InputLabel>{item.title}</InputLabel>
            <Select
              value={itemValue + ""}
              onChange={item.onChange}
              disabled={!editable}
            >
              {item.options.map((option, index) => {
                return (
                  <MenuItem
                    key={"properties-options-" + index}
                    value={option.value}
                  >
                    {`${option.text} ${_getDefaultText(
                      option.value === (item.value.template ?? false)
                    )}`}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
      );
    });
  };

  render() {
    const { t, nodeInst, editable, classes } = this.props;

    if (nodeInst.name === undefined) {
      return <Typography>{t("Loading")}</Typography>;
    } else {
      const sortedPorts = [...this.state.ports].sort((a, b) =>
        a.icon >= b.icon ? 1 : -1
      );
      return (
        <Typography
          component="div"
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <div style={{ flexGrow: 1 }}>
            <CollapseListManager>
              {/* -------------------------------------------- Info --------------------------------------------- */}
              <CollapseItem
                item={<Item text={t("Details")} style={{ padding: "15px" }} />}
              >
                <Typography
                  component="div"
                  style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "0px 6px 0px 6px",
                    flexGrow: 1
                  }}
                >
                  {this.getDetails()}
                  <Divider />
                  <Typography
                    component="div"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flexWrap: "wrap",
                      justifyContent: "center"
                    }}
                  ></Typography>
                  <Divider />
                  {/* -------------------------------------------- Ports --------------------------------------------- */}
                  <Typography
                    component="div"
                    style={{
                      paddingLeft: "8px",
                      fontSize: "0.875rem",
                      paddingTop: "8px"
                    }}
                  >
                    {t("Ports")}
                  </Typography>
                  <Typography
                    component="div"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      overflowY: "auto",
                      overflowX: "hidden"
                    }}
                  >
                    <Typography component="div">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center"
                        }}
                      >
                        <div
                          className="fas fa-sign-in-alt"
                          style={{
                            paddingLeft: "16px",
                            fontSize: "small"
                          }}
                        ></div>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            paddingLeft: "6px"
                          }}
                        >
                          {t("Inputs")}
                        </div>
                      </div>
                      {sortedPorts.map((obj, index) => {
                        if (obj.icon === "fas fa-sign-in-alt") {
                          return (
                            <React.Fragment key={"sortedPorts-" + index}>
                              <Typography
                                component="div"
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  paddingLeft: "16px"
                                }}
                              >
                                <div
                                  style={{
                                    textAlign: "end",
                                    fontSize: "0.875rem",
                                    marginTop: "6px",
                                    paddingRight: "6px"
                                  }}
                                >
                                  {obj.key}
                                </div>
                                <Link
                                  style={{
                                    textAlign: "end",
                                    fontSize: "0.875rem",
                                    paddingRight: "6px"
                                  }}
                                  component="button"
                                  onClick={event => {
                                    obj.sm_id
                                      ? this.open({
                                          id: obj.sm_id,
                                          name: obj.sm_id
                                        })
                                      : this.open(
                                          { id: obj.value, name: obj.value },
                                          event
                                        );
                                  }}
                                >
                                  {obj.sm_id !== undefined
                                    ? obj.sm_id
                                    : obj.value}
                                </Link>
                                <Divider />
                              </Typography>
                            </React.Fragment>
                          );
                        } else return "";
                      })}
                    </Typography>
                    <Typography component="div">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center"
                        }}
                      >
                        <div
                          className="fas fa-sign-out-alt"
                          style={{
                            paddingLeft: "16px",
                            fontSize: "small"
                          }}
                        ></div>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            paddingLeft: "6px"
                          }}
                        >
                          Outputs
                        </div>
                      </div>
                      {sortedPorts.map((obj, index) => {
                        if (obj.icon === "fas fa-sign-out-alt") {
                          return (
                            <React.Fragment key={"sortedPorts-" + index}>
                              <Typography
                                component="div"
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  paddingLeft: "16px",
                                  marginTop: "6px"
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "0.875rem",
                                    textAlign: "end",
                                    paddingRight: "6px"
                                  }}
                                >
                                  {obj.key}
                                  <Divider />
                                </div>
                              </Typography>
                            </React.Fragment>
                          );
                        } else return "";
                      })}
                    </Typography>
                  </Typography>
                </Typography>
              </CollapseItem>
              {/* -------------------------------------------- Properties --------------------------------------------- */}
              <CollapseItem
                item={
                  <Item text={t("Properties")} style={{ padding: "15px" }} />
                }
              >
                <Grid container style={{ padding: "20px" }}>
                  {this.getProperties(editable)}
                </Grid>
              </CollapseItem>
              {/* -------------------------------------------- Parameters --------------------------------------------- */}
              <ParamModal
                handleCloseModal={() => {
                  this.setState({
                    paramModal: {
                      ...this.state.paramModal,
                      open: false,
                      data: {
                        key: "",
                        value: ""
                      }
                    }
                  });
                }}
                openModal={this.state.paramModal.open}
                isNewParam={false}
                viewOnlyMode={!editable}
                dataName={this.state.paramModal.data.key}
                dataValue={this.state.paramModal.data.value}
                dataInfo={this.state.paramModal.data.description}
                defaultValue={this.state.paramModal.data.defaultValue}
                dataType={this.state.paramModal.data.type}
                handleModalConfirm={this.handleModalConfirm}
                disableName
                disableInfo
                showDefault={true}
              ></ParamModal>
              <CollapseItem
                item={
                  <Item text={t("Parameters")} style={{ padding: "15px" }} />
                }
                style={{ display: "flex" }}
              >
                <Typography
                  component="div"
                  style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "0px 6px 0px 6px",
                    flexGrow: 1
                  }}
                >
                  <TableKeyValue
                    list={this.state.params}
                    handleParameterEditModal={this.handleParameterEditModal}
                    type="Parameter"
                    allowEdit={editable}
                    allowSearch
                  />
                </Typography>
              </CollapseItem>
              {/* -------------------------------------------- Env. Variables --------------------------------------------- */}
              <CollapseItem
                item={
                  <Item text={t("Env Variables")} style={{ padding: "15px" }} />
                }
              >
                <Typography component="div">
                  <TableKeyValue
                    list={this.state.env}
                    handleParameterEditModal={this.handleParameterEditModal}
                    onChange={obj => this._onChangeKey("env", obj)}
                    type="EnvVar"
                    allowEdit={editable}
                    allowSearch
                  />
                </Typography>
              </CollapseItem>
              {/* -------------------------------------------- Command Line --------------------------------------------- */}
              <CollapseItem
                item={
                  <Item text={t("Command Line")} style={{ padding: "15px" }} />
                }
              >
                <Typography component="div">
                  <TableKeyValue
                    list={this.state.cmdline}
                    handleParameterEditModal={this.handleParameterEditModal}
                    onChange={obj => this._onChangeKey("cmdline", obj)}
                    type="CmdLine"
                    allowEdit={editable}
                  />
                </Typography>
              </CollapseItem>
              {/* ----------------------------------------------- Group ------------------------------------------------ */}
              <CollapseItem
                item={<Item text={t("Group")} style={{ padding: "15px" }} />}
                style={{ display: "flex" }}
              >
                <Typography
                  component="div"
                  style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "0px 6px 0px 6px",
                    flexGrow: 1,
                    height: "auto"
                  }}
                >
                  {Object.keys(this.props._layers).map((key, index) => {
                    const layer_name = this.props._layers[key].name;
                    const checked = this.state.layers.includes(key);
                    return (
                      <Typography
                        component="div"
                        className={classes.layerRow}
                        key={key}
                      >
                        <Tooltip title={layer_name}>
                          <Typography
                            component="div"
                            className={classes.layerItem}
                            title={layer_name}
                          >
                            {layer_name}
                          </Typography>
                        </Tooltip>
                        <IconButton
                          disabled={!editable}
                          onClick={() => this._onChangeLayers(key, !checked)}
                        >
                          {checked && (
                            <Layers fontSize="small" color="primary" />
                          )}
                          {!checked && (
                            <LayersClear fontSize="small" color="disabled" />
                          )}
                        </IconButton>
                      </Typography>
                    );
                  })}
                </Typography>
              </CollapseItem>
            </CollapseListManager>
          </div>
        </Typography>
      );
    }
  }
}

RNodeMenu.propTypes = {
  flowName: PropTypes.string.isRequired,
  nodeInst: PropTypes.object.isRequired,
  _layers: PropTypes.object,
  openDoc: PropTypes.func,
  editable: PropTypes.bool
};

RNodeMenu.defaultProps = {
  _layers: {},
  openDoc: () => {},
  editable: true
};

export default withStyles(styles, { withTheme: true })(
  withTranslation()(RNodeMenu)
);
