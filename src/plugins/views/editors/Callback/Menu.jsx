import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Tooltip,
  Divider
} from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import Model from "../../../../models/Callback/Callback";
import { PLUGINS } from "../../../../utils/Constants";
import { withDataHandler } from "../../../DocManager/DataHandler";
import useDataSubscriber from "../../../DocManager/useDataSubscriber";
import DetailsMenu from "../_shared/DetailsMenu/DetailsMenu";
import AddImportDialog from "./dialogs/AddImport";
import EditMessageDialog from "./dialogs/EditMessage";

import { menuStyles } from "./styles";

const ACTIVE_ITEM = {
  IMPORTS: 1,
  MESSAGE: 2
};

const Menu = props => {
  // Props
  const { call, scope, name, instance, editable = true } = props;
  // State hook
  const [activeItem, setActiveItem] = useState(0);
  // Other hooks
  const classes = menuStyles();
  const { t } = useTranslation();
  const { data } = useDataSubscriber({
    instance,
    propsData: props.data,
    keysToDisconsider: [Model.OBSERVABLE_KEYS.CODE]
  });

  //========================================================================================
  /*                                                                                      *
   *                                 Document Functions                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Delete import from model
   * @param {*} pyLib
   */
  const deleteImport = useCallback(
    pyLib => {
      if (instance.current) instance.current.getPyLibs().deleteItem(pyLib.key);
    },
    [instance]
  );

  /**
   * Add Imports
   * @param {*} pyLibs
   */
  const addImports = useCallback(
    pyLibs => {
      if (instance.current) instance.current.getPyLibs().setData(pyLibs);
      setActiveItem(ACTIVE_ITEM.IMPORTS);
    },
    [instance]
  );

  /**
   * Set message
   * @param {string} msg
   */
  const setMessage = useCallback(
    msg => {
      if (instance.current) instance.current.setMessage(msg);
      setActiveItem(ACTIVE_ITEM.MESSAGE);
    },
    [instance]
  );

  //========================================================================================
  /*                                                                                      *
   *                                   Handle Events                                      *
   *                                                                                      */
  //========================================================================================

  /**
   * Open dialog to set callback message
   */
  const handleEditMessageClick = useCallback(
    evt => {
      evt.stopPropagation();

      call(
        PLUGINS.DIALOG.NAME,
        PLUGINS.DIALOG.CALL.CUSTOM_DIALOG,
        {
          onSubmit: setMessage,
          selectedMessage: data.message,
          scope: scope,
          call: call
        },
        EditMessageDialog
      );
    },
    [scope, data.message, call, setMessage]
  );

  /**
   * Open dialog to add imports
   */
  const handleAddImportsClick = useCallback(
    evt => {
      evt.stopPropagation();

      call(
        PLUGINS.DIALOG.NAME,
        PLUGINS.DIALOG.CALL.CUSTOM_DIALOG,
        {
          onSubmit: addImports,
          scope: scope,
          call: call
        },
        AddImportDialog
      );
    },
    [scope, addImports, call]
  );

  /**
   * Handle expand/collapse action
   *  If item is collapsed : Expand item and collapse other
   *  If item is expanded  : Collapse item and let all others collapsed as well
   * @param {*} evt
   */
  const handleExpandClick = useCallback(evt => {
    const activeItem = parseInt(evt.currentTarget.dataset.activeItem);
    setActiveItem(prevState => {
      if (prevState === activeItem) return 0;
      else return activeItem;
    });
  }, []);

  /**
   * Handler to remove the message
   */
  const handleRemoveMessage = useCallback(() => {
    if (instance.current) instance.current.setMessage("");
    setActiveItem(ACTIVE_ITEM.MESSAGE);
  }, [instance]);

  //========================================================================================
  /*                                                                                      *
   *                                 Private methods                                      *
   *                                                                                      */
  //========================================================================================

  /**
   * Check if collapse item is expanded
   * @private function
   * @param {integer} _item : Collapse item id
   * @returns {boolean} True if collapse item is expanded, False otherwise
   */
  const isActive = useCallback(
    _item => {
      return activeItem === _item;
    },
    [activeItem]
  );

  /**
   * Get name to be rendered in import row
   * @private function
   * @param {string} key
   * @param {string} libClass
   * @param {string} libModule
   * @returns {string} Lib title to be rendered in import row
   */
  const getComposedName = useCallback((key, libClass, libModule) => {
    if (libClass === undefined) {
      return key === libModule
        ? "import " + libModule
        : "import " + libModule + " as " + key;
    } else {
      return key === libClass
        ? "from " + libModule + " import " + libClass
        : "from " + libModule + " import " + libClass + " as " + key;
    }
  }, []);

  /**
   * Get the list of imports
   * @private function
   */
  const getImportsList = useCallback(() => {
    const pyLibs = data.pyLibs || {};
    const importList = [];

    Object.keys(pyLibs).forEach(key => {
      const lib = pyLibs[key];
      const libModule = lib.module ? lib.module : undefined;
      const libClass = lib.libClass ? lib.libClass : undefined;
      const name_composed = getComposedName(key, libClass, libModule);
      const obj = { name: name_composed, key: key };
      if (libModule) importList.push(obj);
    });

    return importList;
  }, [data.pyLibs, getComposedName]);

  //========================================================================================
  /*                                                                                      *
   *                                   Render Functions                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Get Imports
   * @returns {ReactElement} React element to be rendered in Imports collapse item
   */
  const getImports = useCallback(() => {
    const pyLibs = getImportsList();
    return pyLibs.length > 0 ? (
      pyLibs.map((pyLib, index) => {
        return (
          <Typography key={"imports_" + index}>
            <Divider />
            <ListItem>
              <ListItemText
                className={classes.itemLibValue}
                primary={pyLib.name}
              />
              <ListItemSecondaryAction>
                <Tooltip title={t("Remove import")}>
                  <IconButton edge="end" onClick={() => deleteImport(pyLib)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          </Typography>
        );
      })
    ) : (
      <Typography className={`${classes.itemValue} ${classes.disabled}`}>
        {t("No imports")}
      </Typography>
    );
  }, [classes, getImportsList, deleteImport, t]);

  /**
   * Get Callback message
   * @returns {ReactElement} React element to be rendered in Message collapse item
   */
  const getMessage = useCallback(() => {
    return data.message ? (
      <Typography>
        <Divider />
        <ListItem>
          <ListItemText
            className={classes.itemLibValue}
            primary={data.message}
          />
          <ListItemSecondaryAction>
            <Tooltip title={t("Remove message")}>
              <IconButton edge="end" onClick={handleRemoveMessage}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>
      </Typography>
    ) : (
      <Typography className={`${classes.itemValue} ${classes.disabled}`}>
        {t("No message defined")}
      </Typography>
    );
  }, [classes, data.message, handleRemoveMessage, t]);

  return (
    <div>
      <DetailsMenu name={name} details={data.details || {}}></DetailsMenu>
      <List>
        {/* ============ IMPORTS ============ */}
        <ListItem
          button
          data-active-item={ACTIVE_ITEM.IMPORTS}
          onClick={handleExpandClick}
        >
          <ListItemText primary={t("Imports")} />
          <IconButton disabled={!editable} onClick={handleAddImportsClick}>
            <AddIcon />
          </IconButton>
          {isActive(ACTIVE_ITEM.IMPORTS) ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={isActive(ACTIVE_ITEM.IMPORTS)} unmountOnExit>
          {getImports()}
          <Divider />
        </Collapse>
        {/* ============ MESSAGE ============ */}
        <ListItem
          button
          data-active-item={ACTIVE_ITEM.MESSAGE}
          onClick={handleExpandClick}
        >
          <ListItemText primary={t("Message")} />
          <IconButton disabled={!editable} onClick={handleEditMessageClick}>
            <EditIcon />
          </IconButton>
          {isActive(ACTIVE_ITEM.MESSAGE) ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={isActive(ACTIVE_ITEM.MESSAGE)} unmountOnExit>
          {getMessage()}
          <Divider />
        </Collapse>
      </List>
    </div>
  );
};

export default withDataHandler(Menu);
