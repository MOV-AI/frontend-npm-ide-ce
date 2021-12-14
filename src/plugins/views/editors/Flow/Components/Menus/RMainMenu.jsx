import React, { Component } from "react";
import { IconButton, Tooltip, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import CollapseListManager from "../../../_shared/ListItems/CollapseListManager";
import CollapseItem from "../../../_shared/ListItems/CollapseItem";
import DetailsCollapseItem from "../../../_shared/ListItems/DetailsCollapseItem";
import { Item } from "../../../_shared/ListItems/Item";
import ListVersioning from "../../../_shared/ListItems/ListVersioning";
import MasterComponent from "../../../MasterComponent/MasterComponent";
import { randomId } from "../../../_shared/Utils/Utils";
import { Rest } from "@mov-ai/mov-fe-lib-core";
import ParamModal from "../../../NodeEditor/KeyValueTable/ParamModal/ParamModal2";
import _get from "lodash/get";
import _isEmpty from "lodash/isEmpty";
import RestApi from "../../Core/Api/RestApi";
import TableKeyValue from "./TableKeyValue";
import LayerModal from "./LayerModal";
import { withTranslation } from "react-i18next";
import { replaceStringToPyBool } from "../../../NodeEditor/utils/Utils";

const styles = theme => ({
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

class RMainMenu extends Component {
  defaultParam = {
    key: "",
    value: "",
    placeholder: "",
    description: "",
    type: ""
  };
  state = {
    layers: {},
    parameters: {},
    paramModal: {
      open: false,
      data: { ...this.defaultParam },
      edit: false,
      type: "" //params, env, cmdline
    },
    layerModal: {
      open: false,
      name: "",
      id: randomId(),
      isNewLayer: false
    }
  };

  /**
   * Change layer active state by key
   * @param {String} key : Layer key
   * @param {Boolean} activeState : Active state
   */
  _onChangeLayers = (key, activeState) => {
    this.setState(prevState => {
      const newState = {
        layers: {
          ...prevState.layers,
          [key]: { ...prevState.layers[key], on: activeState }
        }
      };
      this.props.setLayersOn({ ...newState.layers });
      return newState;
    });
  };

  saveFlowLayers = (_layers = null) => {
    const { t } = this.props;
    const layers = _layers ? _layers : this.state.layers;
    const new_layers = {};
    Object.keys(layers).forEach(layer => {
      new_layers[layer] = { name: layers[layer].name, on: true };
    });
    const args = {
      flowId: this.props.uid,
      layers: new_layers
    };
    Rest.cloudFunction({
      cbName: "backend.FlowAPI",
      func: "saveFlowLayers",
      args
    }).then(res => {
      if (res.success) {
        MasterComponent.alert(t("Group successfully saved."));
      } else {
        MasterComponent.alert(res.error, "error");
      }
    });
  };

  deleteLayer = (layer = null) => {
    const { t } = this.props;
    const layers = { ...this.state.layers };
    // Show confirmation alert
    MasterComponent.confirmAlert(
      t("Delete group"),
      `${t("Are you sure you want to delete group")} "${layers[layer]?.name}"?`,
      () => {
        // Trigger callback to delete layer and remove all its references from all nodes
        Rest.cloudFunction({
          cbName: "backend.FlowAPI",
          func: "deleteLayer",
          args: {
            flowId: this.props.uid,
            layer: layer
          }
        }).then(res => {
          if (res.success === false) {
            MasterComponent.alert(res.error, "error");
          } else {
            this.setState(prevState => {
              // Setup new state : Remove layer key from previous layers state
              const { [layer]: _, ...newLayers } = prevState.layers;
              // Refresh visibility of nodes after deleting the layer
              this.props.setLayersOn({ ...newLayers });
              // Set new state
              return { ...prevState, layers: newLayers };
            });
            MasterComponent.alert(t("Group successfully deleted."));
          }
        });
      },
      () => {}
    );
  };

  /**
   * Handle layer modal confirm
   * @param {{dataId: String, dataName: String}} values : Modal data
   */
  handleLayerModalConfirm = values => {
    const { layers } = this.state;
    layers[values.dataId] = { name: values.dataName, on: true };

    const args = {
      flowId: this.props.uid,
      layers: layers
    };
    Rest.cloudFunction({
      cbName: "backend.FlowAPI",
      func: "saveFlowLayers",
      args
    }).then(res => {
      if (res.success === false) {
        MasterComponent.alert(res.error, "error");
      } else {
        MasterComponent.alert(`Group successfully saved.`);
      }
    });

    this.setState({
      layerModal: { ...this.state.layerModal, open: false },
      layers
    });
  };

  /**
   * Handle Layer modal validation
   * @param {{dataId: String, dataName: String}} values : Modal data
   * @returns {Boolean} True if dataName is valid
   */
  handleLayerModalValidation = values =>
    !_isEmpty(values.dataName) &&
    !!Object.values(this.state.layers).findIndex(
      elem => elem.name === values.dataName
    );

  /**
   * editDescription - open dialog to edit description
   */
  editDescription = () => {
    const { t } = this.props;
    MasterComponent.createNewApp(
      t("Edit description"),
      value => RestApi.saveFlowDescription(this.props.uid, value), // submit function
      undefined, // cancel function
      undefined, // validation function
      {
        rowsMax: 4,
        rows: 4,
        maxLength: -1,
        inputLabel: t("Description"),
        inputValue: this.props.description
      }
    );
  };

  renderValue = (value, type, is2ParseString) => {
    const renderValueByType = {
      string: () => (is2ParseString ? JSON.stringify(value) : value),
      boolean: () => replaceStringToPyBool(value)
    };
    return type in renderValueByType ? renderValueByType[type]() : value;
  };

  getParameters = () => {
    const output = [];
    Object.keys(this.state.parameters).forEach(param => {
      const value = _get(this.state.parameters, `${param}.Value`, "");
      const type = _get(this.state.parameters, `${param}.Type`, "any");
      output.push({
        key: param,
        value: this.renderValue(value, type, true)
      });
    });
    return output;
  };

  paramsValidation = values => {
    return !_isEmpty(values.dataName);
  };

  handleModalConfirm = values => {
    const { t } = this.props;
    if (!values.dataName) {
      return MasterComponent.alert(
        t("Parameter name can't be empty"),
        "warning"
      );
    }
    RestApi.saveFlowParam(this.props.uid, values, () => {
      // Close param modal and Add parameter locally
      this.setState(prevState => ({
        paramModal: { ...prevState.paramModal, open: false },
        parameters: {
          ...prevState.parameters,
          [values.dataName]: {
            Value: values.dataValue,
            Description: values.dataInfo,
            Type: values.dataType
          }
        }
      }));
    });
  };

  handleParamDelete = obj => {
    const { t } = this.props;
    MasterComponent.confirmAlert(
      t("Delete parameter"),
      `${t("Are you sure you want to delete")} "${obj.key}"?`,
      () => {
        // Delete from redis
        RestApi.deleteFlowParam(this.props.uid, obj.key, () => {
          // Delete locally
          this.setState(prevState => {
            const { [obj.key]: _, ...newParams } = prevState.parameters;
            return { ...prevState, parameters: newParams };
          });
        });
      },
      () => {}
    );
  };

  handleParamEdit = obj => {
    const { Value, Description, Type } = _get(
      this.state.parameters,
      `${obj.key}`,
      {
        Value: "",
        Description: "",
        Type: ""
      }
    );

    this.setState({
      paramModal: {
        ...this.state.paramModal,
        open: true,
        edit: true,
        data: {
          key: obj.key,
          value: this.renderValue(Value, Type),
          description: Description,
          type: Type
        }
      }
    });
  };

  componentDidUpdate(prevProps) {
    if (prevProps._layers !== this.props._layers)
      this.setState({ layers: { ...this.props._layers } });
    if (prevProps._parameters !== this.props._parameters)
      this.setState({ parameters: { ...this.props._parameters } });
  }

  componentDidMount() {
    this.setState({
      layers: { ...this.props._layers },
      parameters: { ...this.props._parameters }
    });
  }

  render() {
    const {
      t,
      classes,
      user,
      lastUpdate,
      description,
      editable,
      workspace,
      name,
      version
    } = this.props;

    const handleDescriptionClick = e => {
      e.stopPropagation();
      this.editDescription();
    };

    const handleCreateNewParamenter = e => {
      e.stopPropagation();
      this.setState({
        paramModal: {
          ...this.state.paramModal,
          data: { ...this.defaultParam },
          open: true,
          edit: false
        }
      });
    };

    const handleCreateNewLayer = e => {
      e.stopPropagation();
      this.setState({
        layerModal: {
          ...this.state.layerModal,
          data: {},
          open: true,
          id: randomId(),
          isNewLayer: true,
          name: ""
        }
      });
    };

    return (
      <div style={{ padding: "5px" }}>
        <CollapseListManager>
          <DetailsCollapseItem
            userName={user}
            lastUpdated={lastUpdate}
            workspace={workspace}
            name={name}
            version={version === "__UNVERSIONED__" ? "-" : version}
          />
          {this.props.type === "flow" && (
            <CollapseItem
              height="5vh"
              item={
                <Item
                  text={t("Description")}
                  style={{ paddingRight: "15px" }}
                  after={
                    <Tooltip title={t("Edit description")}>
                      <IconButton
                        disabled={!editable}
                        onClick={handleDescriptionClick}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  }
                />
              }
            >
              <Typography
                variant="body2"
                color="textSecondary"
                component="p"
                style={{ padding: "10px" }}
              >
                {description}
              </Typography>
            </CollapseItem>
          )}
          {this.props.type === "flow" && (
            <CollapseItem
              height="auto"
              item={
                <Item
                  text={t("Parameters")}
                  style={{ paddingRight: "15px" }}
                  after={
                    <Tooltip title={t("Create new parameter")}>
                      <IconButton
                        disabled={!editable}
                        onClick={handleCreateNewParamenter}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  }
                />
              }
            >
              <Typography
                component="div"
                style={{
                  overflowY: "auto",
                  overflowX: "hidden",
                  padding: "0px 6px 0px 6px",
                  flexGrow: 1,
                  minHeight: 0
                }}
              >
                <TableKeyValue
                  list={this.getParameters()}
                  allowDelete={editable}
                  allowEdit={editable}
                  handleParameterDeleteModal={this.handleParamDelete}
                  handleParameterEditModal={this.handleParamEdit}
                  type="params"
                  allowSearch
                />
              </Typography>
            </CollapseItem>
          )}
          {this.props.type === "flow" && (
            <LayerModal
              handleCloseModal={() => {
                this.setState({
                  layerModal: { ...this.state.layerModal, open: false }
                });
              }}
              openModal={this.state.layerModal.open}
              isNewLayer={this.state.layerModal.isNewLayer}
              dataName={this.state.layerModal.name}
              dataId={this.state.layerModal.id}
              handleModalConfirm={this.handleLayerModalConfirm}
              handleValidation={this.handleLayerModalValidation}
            ></LayerModal>
          )}
          {this.props.type === "flow" && (
            <CollapseItem
              updateId={this.state.updateId}
              open={this.state.openModal}
              key={"Groups"}
              height="auto"
              item={
                <Item
                  text={t("Groups")}
                  after={
                    <Tooltip title={t("Create new group")}>
                      <IconButton
                        disabled={!editable}
                        onClick={handleCreateNewLayer}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  }
                />
              }
            >
              {Object.keys(this.state.layers).map((key, index) => {
                const layer_name = this.state.layers[key].name;
                const layer_id = key;
                const checked = this.state.layers[key].on;
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
                      onClick={() => this._onChangeLayers(key, !checked)}
                    >
                      {checked && (
                        <VisibilityIcon
                          fontSize="small"
                          color="primary"
                        ></VisibilityIcon>
                      )}
                      {!checked && (
                        <VisibilityOffIcon
                          fontSize="small"
                          color="disabled"
                        ></VisibilityOffIcon>
                      )}
                    </IconButton>
                    {this.props.editable && (
                      <IconButton
                        onClick={() =>
                          this.setState({
                            layerModal: {
                              ...this.state.layerModal,
                              name: layer_name,
                              id: layer_id,
                              open: true,
                              isNewLayer: false
                            }
                          })
                        }
                      >
                        <Edit fontSize="small"></Edit>
                      </IconButton>
                    )}
                    {this.props.editable && (
                      <IconButton
                        onClick={() => {
                          this.deleteLayer(key);
                        }}
                        aria-label="delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Typography>
                );
              })}
            </CollapseItem>
          )}
          <ListVersioning
            workspace={this.props.workspace}
            editable={this.props.editable}
            scope={this.props.type === "flow" ? "Flow" : "StateMachine"}
            id={this.props.uid}
            version={version}
            height="20vh"
            onReloadTab={ListVersioning.getReloadFromProps({
              id: this.props.name,
              name: this.props.name,
              scope: this.props.type === "flow" ? "Flow" : "StateMachine",
              workspace: this.props.workspace
            })}
          ></ListVersioning>
        </CollapseListManager>
        <ParamModal
          handleCloseModal={() => {
            this.setState({
              paramModal: { ...this.state.paramModal, open: false }
            });
          }}
          openModal={this.state.paramModal.open}
          isNewParam={!this.state.paramModal.edit}
          dataName={this.state.paramModal.data.key}
          dataValue={this.state.paramModal.data.value}
          dataInfo={this.state.paramModal.data.description}
          dataType={this.state.paramModal.data.type}
          handleModalConfirm={this.handleModalConfirm}
          handleValidation={this.paramsValidation}
          disableName={this.state.paramModal.edit}
          viewOnlyMode={!editable}
        ></ParamModal>
      </div>
    );
  }
}
RMainMenu.propTypes = {
  uid: PropTypes.string.isRequired,
  _layers: PropTypes.object,
  user: PropTypes.string,
  lastUpdate: PropTypes.string,
  description: PropTypes.string,
  type: PropTypes.string,
  parameters: PropTypes.object,
  editable: PropTypes.bool,
  workspace: PropTypes.string,
  name: PropTypes.string,
  version: PropTypes.string
};

RMainMenu.defaultProps = {
  _layers: {},
  user: "N/A",
  lastUpdate: "N/A",
  description: "N/A",
  type: "string",
  parameters: {},
  editable: true,
  workspace: "NA",
  name: "NA",
  version: "NA"
};

export default withStyles(styles, { withTheme: true })(
  withTranslation()(RMainMenu)
);
