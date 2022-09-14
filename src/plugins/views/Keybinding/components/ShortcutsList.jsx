import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { MenuItem, Tooltip, Paper, Divider } from "@material-ui/core";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";

import { shortcutsListStyles } from "../styles";

const ShortcutsList = props => {
  const { scopes, selectedScope, setSelectedScope } = props;
  const { t } = useTranslation();
  const classes = shortcutsListStyles();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  const isSelectedScope = scopeId => {
    return selectedScope === scopeId;
  };

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  const handleChangeScope = evt => {
    const newScope = evt.currentTarget.id;

    setSelectedScope(newScope);
  };

  return (
    <Paper data-testid="section_shortcuts-list" className={classes.paper}>
      <div className={classes.columnTitle}>{t("Scope")}</div>
      <Divider />
      <div className={classes.columnBody}>
        {scopes.map(scope => (
          <MenuItem
            data-testid="input_shortcut-scope"
            key={scope.id}
            id={scope.id}
            className={`${classes.listItem} ${
              isSelectedScope(scope.id) ? "activeItem" : ""
            }`}
            onClick={handleChangeScope}
          >
            <Tooltip title={scope.description} placement="bottom-start">
              <span className={classes.listContent}>
                {scope.label}
                {isSelectedScope(scope.id) && <ArrowRightIcon />}
              </span>
            </Tooltip>
          </MenuItem>
        ))}
      </div>
    </Paper>
  );
};

ShortcutsList.propTypes = {
  call: PropTypes.func
};

export default ShortcutsList;
