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
  Typography
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
      <List sx={{ width: "100%", bgcolor: "background.paper" }} component="nav">
        <ListItem>
          <ListItemText primary={t("From")} />
        </ListItem>
        <Collapse in>
          <Divider />
          <Typography component="div" className={classes.directionContainer}>
            <ListItem>
              <ListItemText primary={`Node:`} />
              <Typography>{link.sourceNode}</Typography>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary={`Port:`} />
              <Typography>{parsePortName(link.sourcePort)}</Typography>
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
              <ListItemText primary={`Node:`} />
              <Typography>{link.targetNode}</Typography>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary={`Port:`} />
              <Typography>{parsePortName(link.targetPort)}</Typography>
            </ListItem>
          </Typography>
        </Collapse>
        {sourceMessage !== TRANSITION_LINK && (
          <>
            <Divider />
            <ListItem>
              <ListItemText primary={t("Link Dependencies")} />
            </ListItem>
            <Collapse in>
              <Typography
                component="div"
                className={classes.dependencyContainer}
              >
                <FormControl fullWidth={true}>
                  <InputLabel>{t("Dependencies Level")}</InputLabel>
                  <Select
                    value={dependencyLevel}
                    onChange={onChangeDependency}
                    disabled={!editable}
                  >
                    <MenuItem value={0}>{t(`All dependencies`)}</MenuItem>
                    <MenuItem value={1}>{t(`Only From -> To`)}</MenuItem>
                    <MenuItem value={2}>{t(`Only To -> From`)}</MenuItem>
                    <MenuItem value={3}>{t(`No dependencies`)}</MenuItem>
                  </Select>
                  <FormHelperText>
                    {t("Checks node dependencies")}
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
