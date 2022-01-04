import React, { Component } from "react";
import CollapseListManager from "../../../_shared/ListItems/CollapseListManager";
import PropTypes from "prop-types";
import { Item } from "../../../_shared/ListItems/Item";
import CollapseItem from "../../../_shared/ListItems/CollapseItem";

import {
  Grid,
  Typography,
  TextField,
  Input,
  Button,
  IconButton
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/DeleteOutline";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";

import {
  convertParamArrayToRedisObj,
  convertParamsObjToReactArray
} from "./Utils";

import _isEqual from "lodash/isEqual";
import { mergeDeep } from "../../../_shared/Utils/Utils";
import { sortByKey } from "../../../_shared/Utils/Utils";
import { SUCCESS_MESSAGES } from "../../../_shared/constants";
import CallbackEditor from "../../../CallbackEditor/CallbackEditor";
import MasterComponent from "../../../MasterComponent/MasterComponent";
import NativeSelect from "@material-ui/core/NativeSelect";
import FormControl from "@material-ui/core/FormControl";
import { MasterDB } from "@mov-ai/mov-fe-lib-core";
import { withTranslation } from "react-i18next";

class RStateMenu extends Component {
  state = {
    nodeInstName: undefined,
    nodeTemplate: "nodeTemplateXS",
    state: undefined,
    callbacks: [],
    parameters: []
  };
  subscribers_list = [];

  componentDidUpdate(prevProps) {
    const newProps = this.props;

    if (!_isEqual(newProps, prevProps)) {
      this.unsubscribe(); //Remove previous
      this.subscribe(newProps);
      this.setState({ nodeInstName: newProps.nodeInstName, state: undefined });
    }
  }

  componentDidMount() {
    this.subscribe(this.props);
    this.subscribeCallbacks();
    this.setState({ nodeInstName: this.props.nodeInstName, state: undefined });
  }

  componentWillUnmount() {
    //UNSUBSCRIBER
    this.unsubscribe();
    MasterDB.unsubscribe({ Scope: "Callback", Name: "*", Label: "*" });
  }

  saveStateInst = () => {
    const { t } = this.props;
    const key_callback = {
      State: { [this.state.nodeInstName]: { Callback: "*" } }
    };
    const key_parameters = {
      State: { [this.state.nodeInstName]: { Parameter: "*" } }
    };
    let cb_value = undefined;
    try {
      cb_value =
        this.state.state.StateMachine[this.props.flowName].State[
          this.props.nodeInstName
        ].Callback;
    } catch (e) {
      MasterComponent.alert(
        t("Callback is not defined"),
        MasterComponent.ALERTS.error
      );
    }

    if (cb_value !== undefined && cb_value !== "") {
      MasterDB.post(
        "StateMachine",
        this.props.flowName,
        key_callback,
        cb_value,
        (data, status) => {
          if (data !== undefined && data.success) {
            MasterComponent.alert(SUCCESS_MESSAGES.save);
          }
        }
      );
      MasterComponent.alert(SUCCESS_MESSAGES.save);
    } else {
      MasterComponent.alert(
        t("Please add a callback"),
        MasterComponent.ALERTS.warning
      );
    }

    const paramObj = convertParamArrayToRedisObj(this.state.parameters);

    if (paramObj.status) {
      MasterDB.post(
        "StateMachine",
        this.props.flowName,
        key_parameters,
        paramObj.data,
        (data, status) => {
          if (
            data !== undefined &&
            status !== undefined &&
            data.success &&
            status.ok
          ) {
            MasterComponent.alert(SUCCESS_MESSAGES.save);
          }
        }
      );
    } else {
      MasterComponent.confirmAlert(
        t("Invalid data type"),
        paramObj.error,
        () => {},
        () => {},
        "",
        "default",
        "Ok",
        "primary",
        [],
        true,
        true
      );
    }
  };

  getDataToSave = key => {
    let list = {};
    this.state[key].forEach(obj => {
      if (obj.value !== "") {
        list[obj.key] = { Value: obj.value };
      }
    });
    return list;
  };

  unsubscribe = () => {
    this.subscribers_list.forEach(pattern => {
      MasterDB.unsubscribe(pattern);
    });
    this.subscribers_list = [];
    this.setState({ state: undefined });
  };

  subscribe = props => {
    //NODE INST
    const scopeState = {
      Scope: "StateMachine",
      Name: props.flowName,
      State: props.nodeInstName
      //Callback: "*"
    };
    this.subscribers_list.push(scopeState);

    MasterDB.subscribe(
      scopeState,
      data => {
        this._cachemanagement(data);
      },
      data => {
        this.setState({
          state: data.value,
          parameters: convertParamsObjToReactArray(
            data.value.StateMachine[props.flowName].State[props.nodeInstName]
              .Parameter
          )
        });
      }
    );
  };

  subscribeCallbacks = () => {
    //NODE INST
    const scopeCallback = { Scope: "Callback", Name: "*", Label: "*" };

    MasterDB.subscribe(
      scopeCallback,
      data => {},
      data => {
        const listData = data.value.Callback;
        let menuList = []; //Clear
        Object.keys(listData).forEach(key => {
          const obj = { name: listData[key].Label, id: key };
          menuList.push(obj);
        });
        let callbacks = sortByKey(menuList, "name");

        this.setState({ callbacks });
      }
    );
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
    var merged = mergeDeep(this.state.state, this.state_cache);
    this.setState({
      state: merged
    });
    this.state_cache = {};
    this.timer_updateCache = undefined;
  };

  _onChangeKey = (key, obj) => {
    let list = this.state[key];
    const list_f = list.filter(o => obj.key === o.key);
    if (list_f.length > 0) {
      let newO = list_f[0];
      newO.value = obj.value;
    }
    let o = {};
    o[key] = list;
    this.setState({ ...o });
  };

  render() {
    const { nodeInstName } = this.state;
    const { editable } = this.props.parent;
    const { t } = this.props;

    if (nodeInstName === undefined || this.state.state === undefined) {
      return <Typography>{t("Loading")}</Typography>;
    } else {
      let cb_id = "";
      try {
        cb_id =
          this.state.state.StateMachine[this.props.flowName].State[
            this.props.nodeInstName
          ].Callback;
      } catch (e) {}

      return (
        <Typography
          component="div"
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <Typography component="div" style={{ flexGrow: 1 }}>
            <CollapseListManager>
              <CollapseItem
                item={<Item text={t("Callback")} style={{ padding: "15px" }} />}
              >
                <Typography style={CollapseItem.COLLAPSE_ITEM_STYLE}>
                  <Grid container>
                    <Grid item xs={8}>
                      <FormControl>
                        <NativeSelect
                          //className={classes.control}
                          value={cb_id}
                          disabled={!editable}
                          onChange={e => {
                            let { state } = this.state;

                            try {
                              state.StateMachine[this.props.flowName].State[
                                this.props.nodeInstName
                              ].Callback = e.target.value;
                            } catch (err) {
                              state = { StateMachine: {} };
                              state.StateMachine[this.props.flowName] = {
                                State: {}
                              };
                              state.StateMachine[this.props.flowName].State[
                                this.props.nodeInstName
                              ] = { Callback: e.target.value };
                            }

                            this.setState({ state });
                          }}
                          input={<Input />}
                        >
                          {this.state.callbacks.map((obj, objIndex) => {
                            return (
                              <option key={objIndex} value={obj.id}>
                                {obj.name}
                              </option>
                            );
                          })}
                        </NativeSelect>
                      </FormControl>
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton
                        onClick={event => {
                          MasterComponent.onItemClick(
                            CallbackEditor.getComponentFactory({
                              id: cb_id,
                              name: cb_id
                            }),
                            cb_id + ".cb",
                            event.ctrlKey
                          );
                        }}
                      >
                        <EditOutlinedIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Typography>
              </CollapseItem>
              <CollapseItem
                item={
                  <Item text={t("Parameters")} style={{ padding: "15px" }} />
                }
              >
                <Typography
                  style={{
                    paddingLeft: "30px",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflowY: "auto",
                    overflowX: "hidden",
                    height: "490px" // TODO Overflow of Right Menu, not the best solution
                  }}
                >
                  {this.state.parameters.length > 0 ? (
                    <Typography
                      component="div"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center"
                      }}
                    >
                      <Input readOnly value="key"></Input>
                      <Input
                        readOnly
                        value="value"
                        inputProps={{ style: { paddingLeft: "6px" } }}
                      ></Input>
                      <IconButton
                        onClick={() => {
                          const parameters = [...this.state.parameters];
                          parameters.splice(0, 0, { key: "", value: "" });
                          this.setState({ parameters });
                        }}
                        aria-label={t("delete")}
                        disabled={!editable}
                      >
                        <AddIcon />
                      </IconButton>
                    </Typography>
                  ) : (
                    <Typography
                      component="div"
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <IconButton
                        onClick={() => {
                          const parameters = [...this.state.parameters];
                          parameters.splice(0, 0, { key: "", value: "" });
                          this.setState({ parameters });
                        }}
                        aria-label={t("delete")}
                        disabled={!editable}
                      >
                        <AddIcon />
                      </IconButton>
                    </Typography>
                  )}

                  {this.state.parameters !== undefined &&
                    this.state.parameters.map((param, paramIndex) => {
                      return (
                        <Typography
                          key={paramIndex}
                          component="div"
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center"
                          }}
                        >
                          <TextField
                            id="standard-name"
                            placeholder={t("key")}
                            value={param.key}
                            onChange={evt => {
                              const parameters = [...this.state.parameters];
                              parameters[paramIndex].key = evt.target.value;
                              this.setState({ parameters });
                            }}
                            InputProps={{
                              disableUnderline: true
                            }}
                            disabled={!editable}
                          />
                          <TextField
                            id="standard-name"
                            placeholder={t("value")}
                            value={param.value}
                            onChange={evt => {
                              const parameters = [...this.state.parameters];
                              parameters[paramIndex].value = evt.target.value;
                              this.setState({ parameters });
                            }}
                            InputProps={{
                              disableUnderline: true
                            }}
                            style={{ paddingLeft: "6px" }}
                            disabled={!editable}
                          />
                          <IconButton
                            onClick={() => {
                              const parameters = [...this.state.parameters];
                              parameters.splice(paramIndex, 1);
                              this.setState({ parameters });
                            }}
                            aria-label={t("delete")}
                            disabled={!editable}
                          >
                            <DeleteIcon></DeleteIcon>
                          </IconButton>
                        </Typography>
                      );
                    })}
                </Typography>
              </CollapseItem>
            </CollapseListManager>
          </Typography>
          <Typography
            component="div"
            style={{ textAlign: "right", padding: "20px" }}
          >
            <Button
              variant="outlined"
              size="small"
              disabled={!editable}
              onClick={() => this.saveStateInst()}
            >
              {t("Save")}
            </Button>
          </Typography>
        </Typography>
      );
    }
  }
}

RStateMenu.propTypes = {
  nodeInstName: PropTypes.string,
  flowName: PropTypes.string
};

RStateMenu.defaultProps = {
  nodeInstName: "",
  flowName: ""
};

export default withTranslation()(RStateMenu);
