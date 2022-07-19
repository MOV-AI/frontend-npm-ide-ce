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
import { TRANSITION_LINK } from "../../Constants/constants";
import BasePort from "../Nodes/BaseNode/BasePort";

import { linkMenuStyles } from "./styles";

const LinkMenu = props => {
  // Props
  const { link, editable, sourceMessage, flowModel } = props;
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
      flowModel.current.setLinkDependency(link.id, value);
      setDependencyLevel(value);
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
    const dependency = flowModel.current.getLinkDependency(link.id);
    setDependencyLevel(dependency);
  }, [link, flowModel]);

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
              <Tooltip title={link.sourceNode}>
                <Typography>{link.sourceNode}</Typography>
              </Tooltip>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary={t("Port-Colon")} />
              <Tooltip title={parsePortName(link.sourcePort)}>
                <Typography>{parsePortName(link.sourcePort)}</Typography>
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
              <Tooltip title={link.targetNode}>
                <Typography>{link.targetNode}</Typography>
              </Tooltip>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary={t("Port-Colon")} />
              <Tooltip title={parsePortName(link.targetPort)}>
                <Typography>{parsePortName(link.targetPort)}</Typography>
              </Tooltip>
            </ListItem>
          </Typography>
        </Collapse>
        {sourceMessage !== TRANSITION_LINK && (
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
                  >
                    <MenuItem value={0}>{t("AllDependencies")}</MenuItem>
                    <MenuItem value={1}>{t("OnlyFrom")}</MenuItem>
                    <MenuItem value={2}>{t("OnlyTo")}</MenuItem>
                    <MenuItem value={3}>{t("NoDependencies")}</MenuItem>
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
