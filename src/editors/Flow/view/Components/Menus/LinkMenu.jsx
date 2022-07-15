import React, { useCallback, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Collapse,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Typography,
  Tooltip
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import {
  LINK_DEPENDENCY,
  MOVAI_FLOW_TYPES
} from "../../../../../utils/Constants";
import BasePort from "../Nodes/BaseNode/BasePort";

import { linkMenuStyles } from "./styles";

const LinkMenu = props => {
  // Props
  const { link, editable, sourceMessage, flowModel } = props;
  const linkData = link.data;

  // State Hooks
  const [dependencyLevel, setDependencyLevel] = useState(0);

  // Other Hooks
  const { t } = useTranslation();
  const classes = linkMenuStyles();

  //========================================================================================
  /*                                                                                      *
   *                                        Helper                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Use method from BasePort class to format port name
   * @param {string} name : Port Name
   * @returns {string} Formatted port name
   */
  const parsePortName = useCallback(name => {
    return BasePort.parsePortname(name);
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle change event on dependency select box
   * @param {Event} evt : Change event
   */
  const onChangeDependency = useCallback(
    evt => {
      const value = evt.target.value;
      flowModel.current.setLinkDependency(link.data.id, value);
      setDependencyLevel(value);
      // Let's change the link color temporarily
      link.setTemporaryDependency(value).changeStrokeColor();
    },
    [flowModel, link]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  // On component mount or change Link prop
  useEffect(() => {
    const dependency = flowModel.current.getLinkDependency(linkData.id);
    setDependencyLevel(dependency);
  }, [linkData, flowModel]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div data-testid="section_flow-link-menu">
      <h2>{t("Link")}</h2>
      <List className={classes.listHolder} component="nav">
        <ListItem>
          <ListItemText primary={t("From")} />
        </ListItem>
        <Collapse in>
          <Divider />
          <Typography component="div" className={classes.directionContainer}>
            <ListItem>
              <ListItemText primary={t("Node-Colon")} />
              <Tooltip title={linkData.sourceNode}>
                <Typography>{linkData.sourceNode}</Typography>
              </Tooltip>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary={t("Port-Colon")} />
              <Tooltip title={parsePortName(linkData.sourcePort)}>
                <Typography>{parsePortName(linkData.sourcePort)}</Typography>
              </Tooltip>
            </ListItem>
          </Typography>
        </Collapse>
        <Divider />
        <ListItem>
          <ListItemText primary={t("To")} />
        </ListItem>
        <Collapse in>
          <Divider />
          <Typography component="div" className={classes.directionContainer}>
            <ListItem>
              <ListItemText primary={t("Node-Colon")} />
              <Tooltip title={linkData.targetNode}>
                <Typography>{linkData.targetNode}</Typography>
              </Tooltip>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary={t("Port-Colon")} />
              <Tooltip title={parsePortName(linkData.targetPort)}>
                <Typography>{parsePortName(linkData.targetPort)}</Typography>
              </Tooltip>
            </ListItem>
          </Typography>
        </Collapse>
        {sourceMessage !== MOVAI_FLOW_TYPES.LINKS.TRANSITION && (
          <>
            <Divider />
            <ListItem>
              <ListItemText primary={t("LinkDependencies")} />
            </ListItem>
            <Collapse in>
              <Typography
                component="div"
                className={classes.dependencyContainer}
              >
                <FormControl fullWidth={true}>
                  <InputLabel>{t("DependenciesLevel")}</InputLabel>
                  <Select
                    value={dependencyLevel}
                    onChange={onChangeDependency}
                    disabled={!editable}
                    className={classes.selectHolder}
                  >
                    {Object.values(LINK_DEPENDENCY).map(dep => {
                      return (
                        <MenuItem
                          key={dep.VALUE}
                          value={dep.VALUE}
                          className={classes.infoContainer}
                        >
                          <p>{t(dep.LABEL)}</p>
                          <div
                            className={classes.colorChip}
                            style={{ backgroundColor: dep.COLOR }}
                          ></div>
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <FormHelperText>
                    {t("LinkDependenciesHelperText")}
                  </FormHelperText>
                </FormControl>
              </Typography>
            </Collapse>
          </>
        )}
      </List>
    </div>
  );
};

LinkMenu.propTypes = {
  flowModel: PropTypes.object.isRequired,
  link: PropTypes.object.isRequired,
  editable: PropTypes.bool,
  sourceMessage: PropTypes.string
};

LinkMenu.defaultProps = {
  editable: true,
  sourceMessage: ""
};

export default LinkMenu;
