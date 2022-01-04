import React, { Component } from "react";
import CollapseListManager from "../../../_shared/ListItems/CollapseListManager";
import PropTypes from "prop-types";
import { Item } from "../../../_shared/ListItems/Item";
import CollapseItem from "../../../_shared/ListItems/CollapseItem";
import { Typography, Link } from "@material-ui/core";
import ParamModal from "../../../NodeEditor/KeyValueTable/ParamModal/ParamModal2";
import lodash from "lodash";
import RestApi from "../../Core/Api/RestApi";
import TableKeyValue from "./TableKeyValue";
import { MasterDB, Document } from "@mov-ai/mov-fe-lib-core";
import { withTranslation } from "react-i18next";
import { replaceStringToPyBool } from "../../../NodeEditor/utils/Utils";

class RContainerMenu extends Component {
  // parameter default object
  defaultParam = {
    key: "",
    value: "",
    defaultValue: "",
    description: "",
    type: ""
  };

  // component state
  state = {
    paramModal: {
      open: false,
      data: { ...this.defaultParam },
      edit: false,
      viewOnly: false,
      type: "" //params, env, cmdline
    },
    parameters: {},
    instance_parameters: {},
    template_parameters: {},
    subFlowDoc: {
      workspace: "global",
      type: "Flow",
      name: "",
      version: "-"
    }
  };

  // subscribers list
  subscribers_list = [];

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  componentDidMount() {
    this.getDocument();
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe(this.subscribers_list);
  }

  componentDidUpdate(prevProps) {
    const newProps = this.props;
    if (!lodash.isEqual(newProps, prevProps)) {
      this.unsubscribe(this.subscribers_list); // Remove previous
      this.getDocument(); // Update right menu data
      this.subscribe();
    }
  }

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  renderValue = (value, type) => {
    const renderValueByType = {
      boolean: () => (value ? replaceStringToPyBool(value) : "")
    };
    return type in renderValueByType ? renderValueByType[type]() : value;
  };

  /**
   * getParameters - converts paramters object
   *
   * @param {object} parameters object with parameters {param1: {Value: param1_value}, ...}
   *
   * @returns {array} output [{key: <name>, value: <value>}]
   */
  getParameters = parameters => {
    const output = [];

    Object.keys(parameters).forEach(key => {
      const value = lodash.get(parameters, `${key}.Value`, null);
      const defaultValue = lodash.get(parameters, `${key}.defaultValue`, null);
      const type = lodash.get(parameters, `${key}.Type`, "any");

      if (value !== null)
        output.push({
          key: key,
          value: this.renderValue(value, type),
          type: type,
          defaultValue: this.renderValue(defaultValue, type),
          invalid: parameters[key].invalid
        });
    });
    return output;
  };

  getDocument = () => {
    const args = Document.parsePath(this.props.container.ContainerFlow, "Flow");
    this.setState({ subFlowDoc: { ...args } });
  };

  _parseName = (path, scope = "Flow") => {
    let workspace = "global",
      type = scope,
      name = "",
      version = "-";
    const split = path.split("/");

    if (split.length === 1) {
      [name] = split;
    } else {
      [, workspace, type, name, version] = split;
    }

    return { workspace, type, name, version };
  };

  /**
   * Update container parameters
   */
  _updateParams = () => {
    const { instance_parameters, template_parameters } = this.state;
    const paramKeys = Array.from(
      new Set([
        ...Object.keys(instance_parameters),
        ...Object.keys(template_parameters)
      ])
    );
    this.setState(prevState => {
      const newParams = { ...prevState.parameters };
      paramKeys.forEach(key => {
        newParams[key] = {
          ...newParams[key],
          Value: instance_parameters[key]?.Value || "",
          Type: template_parameters[key]?.Type || "any",
          defaultValue: template_parameters[key]?.Value,
          invalid: !template_parameters[key]
        };
      });
      return { ...prevState, parameters: newParams };
    });
  };

  /**
   * Update instance or template parameters
   * @param {String} paramType : One of options "instance_parameters" or "template_parameters"
   * @param {Object} params : Parameters value
   * @param {String} event : One of options "set" or "del"
   */
  _updateSubscribedParameters = (paramType, params, event) => {
    this.setState(prevState => {
      let stateParameters = { ...prevState[paramType] };
      for (const key in params) {
        if (event === "del") delete stateParameters[key];
        else stateParameters[key] = { ...stateParameters[key], ...params[key] };
      }
      return { [paramType]: stateParameters };
    }, this._updateParams);
  };

  /**
   * subscribe to container's parameters updates
   */
  subscribe = () => {
    const pattern_template = {
      Scope: "Flow",
      Name: this.props.container.ContainerFlow,
      Parameter: "*"
    };

    this.subscribers_list.push(pattern_template);
    MasterDB.subscribe(
      pattern_template,
      // on template update
      data => {
        // get updated template parameter
        const param =
          data.key?.Flow?.[this.props.container.ContainerFlow]?.Parameter;
        if (!param) return;
        // Update parameters state variable
        this._updateSubscribedParameters(
          "template_parameters",
          param,
          data.event
        );
      },
      // on template load
      data => {
        // Load template parameter
        const templateParams =
          data.value?.Flow?.[this.props.container.ContainerFlow]?.Parameter ??
          {};
        this._updateSubscribedParameters("template_parameters", templateParams);
        // Load instance parameter
        const pattern_instance = {
          Scope: "Flow",
          Name: this.props.uid,
          Container: this.props.container.name
        };
        this.subscribers_list.push(pattern_instance);
        MasterDB.subscribe(
          pattern_instance,
          // on instance update parameter
          data => {
            // get updated parameter
            const param =
              data.key?.Flow?.[this.props.uid]?.Container?.[
                this.props.container.name
              ]?.Parameter;
            if (!param) return;

            // Update parameter
            this._updateSubscribedParameters(
              "instance_parameters",
              param,
              data.event
            );
          },
          // On Load instance parameter
          data => {
            // load parameters
            const params =
              data.value?.Flow?.[this.props.uid]?.Container?.[
                this.props.container.name
              ]?.Parameter;
            if (!params) return;
            // Update parameter
            this._updateSubscribedParameters("instance_parameters", params);
          }
        );
      }
    );
  };

  /**
   * unsubscribe from updates
   *
   * @param {array} patterns list of patterns to unsubscribe
   */
  unsubscribe = patterns => {
    patterns.forEach(pattern => {
      MasterDB.unsubscribe(pattern);
    });
    this.subscribers_list = [];
  };

  /**
   * paramsValidation - validates form values
   *
   * @returns {bool} true if form is valid else false
   */
  paramsValidation = values => {
    return !lodash.isEmpty(values.dataName);
  };

  /**
   * handleModalConfirm - send request to save parameter
   *
   * @param {object} values parameter to save  {dataName: <name>, dataInfo: <info>, dataValue: <value>}
   */
  handleModalConfirm = values => {
    // request to save parameter
    RestApi.saveContainerParam(
      this.props.uid,
      this.props.container.name,
      values
    );

    // update component state
    this.setState(prevState => ({
      paramModal: { ...prevState.paramModal, open: false }
    }));
  };

  /**
   * handleParamDelete - send request to delete the parameter
   *
   * @param {object} obj object with the parameter name in obj.key
   */
  handleParamDelete = obj => {
    // request to delete parameter
    const containerName = this.props.container.name;
    this.props.appInterface.confirmAlert(
      "Delete parameter",
      `Are you sure you want to delete "${obj.key}"?`,
      () =>
        RestApi.deleteContainerParam(
          this.props.uid,
          containerName,
          obj.key,
          () => {
            // Delete param locally
            this.setState(prevState => {
              const { [obj.key]: _, ...newParams } = prevState.parameters;
              this.props.updateContainerParams(containerName, newParams);
              return { parameters: newParams };
            });
          }
        ),
      () => {}
    );
  };

  /**
   * handleParamEdit - opens the parameter's editor
   *
   * @param {object} obj object with the parameter name in obj.key
   *
   */
  handleParamEdit = obj => {
    // get the parameter value and the description
    const { Value, Description, Type } = lodash.get(
      this.state.parameters,
      obj.key,
      {
        Value: "",
        Description: "",
        Type: ""
      }
    );

    // set editor values and open it
    this.setState(prevState => ({
      paramModal: {
        ...prevState.paramModal,
        open: true,
        edit: true,
        viewOnly: obj.invalid,
        data: {
          key: obj.key,
          value: Value,
          type: Type,
          defaultValue: obj.defaultValue,
          description: Description
        }
      }
    }));
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
          this.props.openFlow({
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

  getDetails = () => {
    const { t } = this.props;
    const { workspace, type, name, version } = this.state.subFlowDoc;

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
      { title: t("Type"), value: "Sub Flow" }
    ];

    return details.map((entry, index) => {
      return (
        <Typography
          key={index}
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

  render() {
    const { t, editable } = this.props;
    const params = this.getParameters(this.state.parameters);

    return (
      <Typography
        component="div"
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div style={{ flexGrow: 1 }}>
          <CollapseListManager>
            <CollapseItem
              item={<Item text={t("Details")} style={{ padding: "15px" }} />}
            >
              <Typography
                component="div"
                style={{
                  overflowY: "auto",
                  overflowX: "hidden",
                  padding: "0px 20px 0px 6px",
                  flexGrow: 1
                }}
              >
                {this.getDetails()}
              </Typography>
            </CollapseItem>
            <ParamModal
              handleCloseModal={() => {
                this.setState({
                  paramModal: { ...this.state.paramModal, open: false }
                });
              }}
              openModal={this.state.paramModal.open}
              isNewParam={!this.state.paramModal.edit}
              dataName={this.state.paramModal.data.key}
              dataType={this.state.paramModal.data.type}
              dataValue={this.state.paramModal.data.value}
              dataInfo={this.state.paramModal.data.description}
              handleModalConfirm={this.handleModalConfirm}
              handleValidation={this.paramsValidation}
              disableName={this.state.paramModal.edit}
              viewOnlyMode={this.state.paramModal.viewOnly}
              defaultValue={this.state.paramModal.data.defaultValue}
              showDescription={false}
              showDefault
            ></ParamModal>
            <CollapseItem
              height="40vh"
              item={<Item text={t("Parameters")} style={{ padding: "15px" }} />}
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
                  list={params}
                  handleParameterDeleteModal={this.handleParamDelete}
                  handleParameterEditModal={this.handleParamEdit}
                  type="params"
                  allowDeleteFunction={param => param.invalid}
                  allowEditFunction={param => !param.invalid && editable}
                  allowSearch
                />
              </Typography>
            </CollapseItem>
          </CollapseListManager>
        </div>
      </Typography>
    );
  }
}

RContainerMenu.propTypes = {
  appInterface: PropTypes.object,
  uid: PropTypes.string.isRequired,
  container: PropTypes.object.isRequired,
  openFlow: PropTypes.func.isRequired,
  editable: PropTypes.bool
};

RContainerMenu.defaultProps = {
  appInterface: {
    confirmAlert: (
      title = "",
      message = "",
      okCallback = () => {},
      cancelCallback = () => {}
    ) => {
      const response = window.confirm(title);
      if (response) okCallback();
      else cancelCallback();
    }
  },
  editable: true
};

export default withTranslation()(RContainerMenu);
