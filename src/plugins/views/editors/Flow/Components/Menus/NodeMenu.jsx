import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { DEFAULT_FUNCTION, useTranslation } from "../../../_shared/mocks";
import {
  Collapse,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography
} from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import LayersIcon from "@material-ui/icons/Layers";
import LayersClearIcon from "@material-ui/icons/LayersClear";
import CallbackModel from "../../../../../../models/Callback/Callback";
import TableKeyValue from "./TableKeyValue";
import styles from "./styles";

//========================================================================================
/*                                                                                      *
 *                                       Constants                                      *
 *                                                                                      */
//========================================================================================

const ACTIVE_ITEM = {
  properties: 1,
  parameters: 2,
  envVars: 3,
  cmdLine: 4,
  group: 5
};

const TABLE_KEYS_NAMES = {
  parameters: "Parameter",
  envVars: "EnvVar",
  cmdLine: "CmdLine"
};

const EMPTY_MESSAGE = {
  Parameter: "No Parameters",
  EnvVar: "No Environment Variables",
  CmdLine: "No Command Lines"
};

const useStyles = makeStyles(styles);

/**
 * Node Link Component
 * @param {*} props: Component props
 * @returns {ReactElement}
 */
const NodeLink = props => {
  const { scope, name, openDoc, children } = props;
  const classes = useStyles();

  const onClickLink = React.useCallback(
    event => {
      openDoc({
        name,
        scope,
        ctrlKey: event.ctrlKey
      });
    },
    [openDoc, name, scope]
  );

  return (
    <Link component="button" className={classes.link} onClick={onClickLink}>
      {children}
    </Link>
  );
};

/**
 * Node Menu Component
 * @param {*} props : Component props
 * @returns {ReaactElement} Node Menu
 */
const NodeMenu = props => {
  // Props
  const { nodeInst, call, openDoc, editable, model } = props;
  // State hooks
  const [templateData, setTemplateData] = React.useState({});
  const [activeItem, setActiveItem] = React.useState(0);
  // Other hooks
  const classes = useStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                        Helper                                        *
   *                                                                                      */
  //========================================================================================

  const data = nodeInst.data;

  /**
   * @private Handle expand/collapse action
   *  If item is collapsed : Expand item and collapse other
   *  If item is expanded  : Collapse item and let all others collapsed as well
   * @param {*} _activeItem
   */
  const handleExpandClick = useCallback(newActiveItem => {
    setActiveItem(prevState => {
      if (prevState === newActiveItem) return 0;
      else return newActiveItem;
    });
  }, []);

  /**
   * @private Get node input/output ports
   * @param {*} ports
   * @returns {array} Input and Output ports
   */
  const getPorts = useCallback(ports => {
    const inputPorts = [];
    const outputPorts = [];
    Object.keys(ports).forEach(portName => {
      const port = ports[portName];
      const inputs = Object.values(port.In);
      const outputs = Object.values(port.Out);
      if (inputs.length) {
        inputPorts.push({
          name: portName,
          value: inputs.map(el => el.Callback)
        });
      }
      if (outputs.length) {
        outputPorts.push({ name: portName });
      }
    });
    return [inputPorts, outputPorts];
  }, []);

  /**
   * @private Get default text for properties template value
   * @param {boolean} isDefault : If option is default value
   * @returns {string} string to concatenate with label
   */
  const getDefaultText = useCallback(isDefault => {
    return isDefault ? "(default)" : "";
  }, []);

  /**
   * @private Get parameters to render in menu
   * @returns {array} Formatted parameters to render in right menu
   */
  const getParameters = useCallback(() => {
    const output = [];
    const parameters = data?.Parameter || {};
    const templateParams = templateData.Parameter || {};
    const allParams = [
      ...Object.keys(parameters),
      ...Object.keys(templateParams)
    ];
    // Iterate all parameters
    allParams.forEach(param => {
      const value = parameters?.[param]?.Value || "";
      const type = templateParams?.[param]?.Type || "any";
      const description = templateParams?.[param]?.Description || "";
      const defaultValue = templateParams?.[param]?.Value || "";
      output.push({
        key: param,
        type,
        value,
        description,
        defaultValue
      });
    });
    return output;
  }, [data?.Parameter, templateData]);

  /**
   * @private Get values for Env. Variables and Command Lines
   * @param {string} varName One of "EnvVar" or "CmdLine"
   * @returns {array} Formatted values to render in right menu
   */
  const getTableValues = useCallback(
    varName => {
      const output = [];
      const instanceValues = data[varName] || {};
      const templateValues = templateData[varName] || {};
      const allValues = [
        ...Object.keys(instanceValues),
        ...Object.keys(templateValues)
      ];
      allValues.forEach(key => {
        const value = instanceValues[key]?.Value || "";
        const defaultValue = templateValues[key]?.Value;
        const description = templateValues[key]?.Description || "";
        output.push({
          key,
          value,
          description,
          defaultValue
        });
      });
      return output;
    },
    [data, templateData]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    const name = data?.Template;
    if (!data?.Template) return;
    // Read node template
    call("docManager", "read", { name, scope: data.model }).then(doc => {
      setTemplateData(doc.serializeToDB());
    });
  }, [data, call]);

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  const onChangeProperties = useCallback((varName, value) => {
    console.log("debug onChangeProperties", varName, value);
  }, []);

  const handleParamEdit = useCallback(() => {
    console.log("debug handleParamEdit");
  }, []);

  const handleTableKeyEdit = useCallback((varName, value) => {
    console.log("debug handleParamEdit", varName, value);
  }, []);

  const handleBelongGroup = useCallback((groupId, checked) => {
    console.log("debug handleBelongGroup", groupId, checked);
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Render ports data
   * @param {{name: string, value: array}} portsData
   * @returns {ReactElement} Ports data
   */
  const renderPortsData = useCallback(
    portsData => {
      return portsData.map(port => {
        return (
          <Typography component="div" className={classes.portRow}>
            <Typography component="div" className={classes.portName}>
              {port.name}
            </Typography>
            {port.value?.map(callback => {
              return (
                <Link
                  className={classes.portCallbackLink}
                  component="button"
                  onClick={event => {
                    openDoc({
                      scope: CallbackModel.SCOPE,
                      name: callback,
                      ctrlKey: event.ctrlKey
                    });
                  }}
                >
                  {callback}
                </Link>
              );
            })}
            <Divider />
          </Typography>
        );
      });
    },
    [classes, openDoc]
  );

  /**
   * Render ports
   * @returns
   */
  const renderPorts = useCallback(() => {
    const [inputPorts, outputPorts] = getPorts(templateData.PortsInst || {});
    return (
      <>
        <Typography component="div" className={classes.detailsSection}>
          {t("Ports:")}
        </Typography>
        <Typography component="div" className={classes.detailsContent}>
          <Typography component="div">
            {/* ======== Input ports ======== */}
            {inputPorts.length > 0 && (
              <>
                <div className={classes.detailRow}>
                  <div className={`icon-in ${classes.portIcon}`}></div>
                  <div className="content">{t("Inputs")}</div>
                </div>
                {renderPortsData(inputPorts)}
              </>
            )}
            {/* ======== Output ports ======== */}
            {outputPorts.length > 0 && (
              <>
                <div className={classes.detailRow}>
                  <div className={`icon-out ${classes.portIcon}`}></div>
                  <div className="content">{t("Outputs")}</div>
                </div>
                {renderPortsData(outputPorts)}
              </>
            )}
          </Typography>
        </Typography>
      </>
    );
  }, [getPorts, templateData.PortsInst, classes, t, renderPortsData]);

  /**
   * Render Properties
   * @returns {ReactElement} Component to render in Properties section
   */
  const renderProperties = useCallback(() => {
    const { Persistent, Remappable, Launch } = data;
    const properties = [
      {
        title: t("Persistent"),
        value: {
          template: templateData.Persistent,
          instance: Persistent
        },
        onChange: evt => onChangeProperties(evt.target.value, "Persistent"),
        options: [
          { text: t("Is persistent"), value: true },
          { text: t("Not persistent"), value: false }
        ]
      },
      {
        title: t("Remappable"),
        value: {
          template: templateData.Remappable,
          instance: Remappable
        },
        onChange: evt => onChangeProperties(evt.target.value, "Remappable"),
        options: [
          { text: t("Is remappable"), value: true },
          { text: t("Not remappable"), value: false }
        ]
      },
      {
        title: t("Launch"),
        value: {
          template: templateData.Launch,
          instance: Launch
        },
        onChange: evt => onChangeProperties(evt.target.value, "Launch"),
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
              value={itemValue.toString()}
              onChange={item.onChange}
              disabled={!editable}
            >
              {item.options.map((option, optIndex) => {
                return (
                  <MenuItem
                    key={"properties-options-" + optIndex}
                    value={option.value}
                  >
                    {`${option.text} ${getDefaultText(
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
  }, [data, onChangeProperties, t, templateData, getDefaultText, editable]);

  /**
   * Render Parameters
   * @returns {ReactElement} Component to render in Parameters section
   */
  const renderParameters = useCallback(() => {
    const params = getParameters();
    return params.length > 0 ? (
      <Typography component="div" className={classes.parametersContainer}>
        <TableKeyValue
          list={params}
          allowEdit={editable}
          handleParameterEditModal={handleParamEdit}
          type="params"
          allowSearch
        />
      </Typography>
    ) : (
      <Typography className={`${classes.itemValue} ${classes.disabled}`}>
        {t(EMPTY_MESSAGE[TABLE_KEYS_NAMES.parameters])}
      </Typography>
    );
  }, [classes, editable, getParameters, handleParamEdit, t]);

  /**
   * Render Env.Variables and Command Lines
   * @param {string} varName : DB Model key name, one of "EnvVar" or "CmdLine"
   * @returns {ReactElement} Component to render in Env. Variables/Command Lines section
   */
  const renderTableValues = useCallback(
    varName => {
      const list = getTableValues(varName);
      return list.length ? (
        <Typography component="div" className={classes.parametersContainer}>
          <TableKeyValue
            list={list}
            allowEdit={editable}
            handleParameterEditModal={handleTableKeyEdit}
            type={varName}
            allowSearch
          />
        </Typography>
      ) : (
        <Typography className={`${classes.itemValue} ${classes.disabled}`}>
          {t(EMPTY_MESSAGE[varName])}
        </Typography>
      );
    },
    [classes, editable, getTableValues, handleTableKeyEdit, t]
  );

  /**
   * Render Group (Node layers belong to)
   * @returns {ReactElement} Component to render in Group section
   */
  const renderGroups = useCallback(() => {
    const nodeGroups = data.NodeLayers;
    const flowGroups = Object.values(model.current.getGroups().serialize());
    return flowGroups.length ? (
      <Typography component="div" className={classes.parametersContainer}>
        {flowGroups.map(group => {
          const key = group.id;
          const groupName = group.name;
          const checked = nodeGroups.includes(key);
          return (
            <Typography component="div" className={classes.groupRow} key={key}>
              <Tooltip title={groupName}>
                <Typography
                  component="div"
                  className={`${classes.itemValue} ${classes.groupItem}`}
                >
                  {groupName}
                </Typography>
              </Tooltip>
              <IconButton onClick={() => handleBelongGroup(key, !checked)}>
                {checked && <LayersIcon fontSize="small" color="primary" />}
                {!checked && (
                  <LayersClearIcon fontSize="small" color="disabled" />
                )}
              </IconButton>
            </Typography>
          );
        })}
      </Typography>
    ) : (
      <Typography className={`${classes.itemValue} ${classes.disabled}`}>
        {t("No groups")}
      </Typography>
    );
  }, [classes, model, data.NodeLayers, handleBelongGroup, t]);

  return (
    <Typography component="div" className={classes.root}>
      <h2 style={{ textAlign: "center" }}>{data.id}</h2>
      <ListItem divider>
        <ListItemText primary={t("Name:")} />
        <NodeLink name={data.Template} scope={data.model} openDoc={openDoc}>
          {data.Template}
        </NodeLink>
      </ListItem>
      <ListItem divider>
        <ListItemText primary={t("Scope:")} />
        <Typography>{data.model}</Typography>
      </ListItem>
      <ListItem divider>
        <ListItemText primary={t("Type:")} />
        <Typography>{templateData.Type || "-"}</Typography>
      </ListItem>
      {renderPorts()}
      {/* =========================== PROPERTIES =========================== */}
      <ListItem
        button
        onClick={() => handleExpandClick(ACTIVE_ITEM.properties)}
      >
        <ListItemText primary={t("Properties")} />
        {activeItem === ACTIVE_ITEM.properties ? (
          <ExpandLess />
        ) : (
          <ExpandMore />
        )}
      </ListItem>
      <Collapse in={activeItem === ACTIVE_ITEM.properties} unmountOnExit>
        <Grid container style={{ padding: "10px 20px 20px" }}>
          {renderProperties()}
        </Grid>
        <Divider />
      </Collapse>
      {/* =========================== PARAMETERS =========================== */}
      <ListItem
        button
        onClick={() => handleExpandClick(ACTIVE_ITEM.parameters)}
      >
        <ListItemText primary={t("Parameters")} />
        {activeItem === ACTIVE_ITEM.parameters ? (
          <ExpandLess />
        ) : (
          <ExpandMore />
        )}
      </ListItem>
      <Collapse in={activeItem === ACTIVE_ITEM.parameters} unmountOnExit>
        {renderParameters()}
        <Divider />
      </Collapse>
      {/* =========================== ENV. VARIABLES =========================== */}
      <ListItem button onClick={() => handleExpandClick(ACTIVE_ITEM.envVars)}>
        <ListItemText primary={t("Env. Variables")} />
        {activeItem === ACTIVE_ITEM.envVars ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={activeItem === ACTIVE_ITEM.envVars} unmountOnExit>
        {renderTableValues(TABLE_KEYS_NAMES.envVars)}
        <Divider />
      </Collapse>
      {/* =========================== COMMAND LINES =========================== */}
      <ListItem button onClick={() => handleExpandClick(ACTIVE_ITEM.cmdLine)}>
        <ListItemText primary={t("Command Line")} />
        {activeItem === ACTIVE_ITEM.cmdLine ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={activeItem === ACTIVE_ITEM.cmdLine} unmountOnExit>
        {renderTableValues(TABLE_KEYS_NAMES.cmdLine)}
        <Divider />
      </Collapse>
      {/* =========================== GROUP =========================== */}
      <ListItem button onClick={() => handleExpandClick(ACTIVE_ITEM.group)}>
        <ListItemText primary={t("Group")} />
        {activeItem === ACTIVE_ITEM.group ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={activeItem === ACTIVE_ITEM.group} unmountOnExit>
        {renderGroups()}
        <Divider />
      </Collapse>
    </Typography>
  );
};

NodeMenu.propTypes = {
  flowName: PropTypes.string.isRequired,
  nodeInst: PropTypes.object.isRequired,
  layers: PropTypes.object,
  openDoc: PropTypes.func,
  editable: PropTypes.bool
};

NodeMenu.defaultProps = {
  openDoc: () => DEFAULT_FUNCTION(),
  layers: {},
  editable: true
};

export default NodeMenu;
