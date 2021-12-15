import React from "react";
import DetailsMenu from "../_shared/DetailsMenu/DetailsMenu";
import AddImportDialog from "./dialogs/AddImport";
import EditMessageDialog from "./dialogs/EditMessage";
import Model from "../../../../models/Callback/Callback";
import { withDataHandler } from "../../../DocManager/DataHandler";
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
import { makeStyles } from "@material-ui/core/styles";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";

const useStyles = makeStyles(theme => ({
  itemValue: {
    padding: "15px 15px 15px 25px",
    fontSize: 14
  },
  itemLibValue: {
    paddingLeft: 10,
    "& span": {
      fontSize: 14
    }
  },
  disabled: {
    color: "gray"
  }
}));

const ACTIVE_ITEM = {
  imports: 1,
  message: 2
};

const Menu = props => {
  // Props
  const {
    call,
    scope,
    name,
    instance,
    data = new Model({}).serialize(),
    editable = true
  } = props;
  // State hook
  const [activeItem, setActiveItem] = React.useState(0);
  // Style hook
  const classes = useStyles();

  //========================================================================================
  /*                                                                                      *
   *                                 Document Functions                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Delete import from model
   * @param {*} pyLib
   */
  const deleteImport = pyLib => {
    if (instance.current) instance.current.getPyLibs().deletePyLib(pyLib);
  };

  /**
   * Add Imports
   * @param {*} pyLibs
   */
  const addImports = pyLibs => {
    if (instance.current) instance.current.getPyLibs().setData(pyLibs);
  };

  /**
   * Set message
   * @param {string} msg
   */
  const setMessage = msg => {
    if (instance.current) instance.current.setMessage(msg);
  };

  //========================================================================================
  /*                                                                                      *
   *                                   Handle Events                                      *
   *                                                                                      */
  //========================================================================================

  /**
   * Open dialog to set callback message
   */
  const handleEditMessageClick = () => {
    call(
      "dialog",
      "customDialog",
      {
        onSubmit: setMessage,
        selectedMessage: data.message,
        scope: scope,
        call: call
      },
      EditMessageDialog
    );
  };

  /**
   * Open dialog to add imports
   */
  const handleAddImportsClick = () => {
    call(
      "dialog",
      "customDialog",
      {
        onSubmit: addImports,
        scope: scope,
        call: call
      },
      AddImportDialog
    );
  };

  /**
   * Handle expand/collapse action
   *  If item is collapsed : Expand item and collapse other
   *  If item is expanded  : Collapse item and let all others collapsed as well
   * @param {*} _activeItem
   */
  const handleExpandClick = _activeItem => {
    setActiveItem(prevState => {
      if (prevState === _activeItem) return 0;
      else return _activeItem;
    });
  };

  //========================================================================================
  /*                                                                                      *
   *                                 Private methods                                      *
   *                                                                                      */
  //========================================================================================

  /**
   * Check if collapse item is expanded
   * @param {integer} _item : Collapse item id
   * @returns {boolean} True if collapse item is expanded, False otherwise
   */
  const _isActive = _item => {
    return activeItem === _item;
  };

  /**
   * Get name to be rendered in import row
   * @param {string} key
   * @param {string} libClass
   * @param {string} libModule
   * @returns {string} Lib title to be rendered in import row
   */
  const _getComposedName = (key, libClass, libModule) => {
    if (libClass === undefined) {
      return key === libModule
        ? "import " + libModule
        : "import " + libModule + " as " + key;
    } else {
      return key === libClass
        ? "from " + libModule + " import " + libClass
        : "from " + libModule + " import " + libClass + " as " + key;
    }
  };

  /**
   * Get the list of imports
   */
  const _getImportsList = () => {
    const pyLibs = data.pyLibs || {};
    const importList = [];

    Object.keys(pyLibs).forEach(key => {
      const lib = pyLibs[key];
      const libModule = lib.Module ? lib.Module : undefined;
      const libClass = lib.Class ? lib.Class : undefined;
      const name_composed = _getComposedName(key, libClass, libModule);
      const obj = { name: name_composed, key: key };
      if (libModule) importList.push(obj);
    });

    return importList;
  };

  //========================================================================================
  /*                                                                                      *
   *                                   Render Functions                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Get Imports
   * @returns {ReactElement} React element to be rendered in Imports collapse item
   */
  const getImports = () => {
    const pyLibs = _getImportsList();
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
                <Tooltip title>
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
        No imports
      </Typography>
    );
  };

  /**
   * Get Callback message
   * @returns {ReactElement} React element to be rendered in Message collapse item
   */
  const getMessage = () => {
    return data.message ? (
      <Typography className={classes.itemValue}>{data.message}</Typography>
    ) : (
      <Typography className={`${classes.itemValue} ${classes.disabled}`}>
        No message defined
      </Typography>
    );
  };

  return (
    <div>
      <DetailsMenu name={name} details={data.details}></DetailsMenu>
      <List>
        {/* ============ IMPORTS ============ */}
        <ListItem button onClick={() => handleExpandClick(ACTIVE_ITEM.imports)}>
          <ListItemText primary="Imports" />
          <IconButton
            disabled={!editable || instance?.current?.getIsNew()}
            onClick={e => {
              e.stopPropagation();
              handleAddImportsClick();
            }}
          >
            <AddIcon />
          </IconButton>
          {_isActive(ACTIVE_ITEM.imports) ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={_isActive(ACTIVE_ITEM.imports)} unmountOnExit>
          {getImports()}
          <Divider />
        </Collapse>
        {/* ============ MESSAGE ============ */}
        <ListItem button onClick={() => handleExpandClick(ACTIVE_ITEM.message)}>
          <ListItemText primary="Message" />
          <IconButton
            disabled={!editable || instance?.current?.getIsNew()}
            onClick={e => {
              e.stopPropagation();
              handleEditMessageClick();
            }}
          >
            <EditIcon />
          </IconButton>
          {_isActive(ACTIVE_ITEM.message) ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={_isActive(ACTIVE_ITEM.message)} unmountOnExit>
          {getMessage()}
          <Divider />
        </Collapse>
      </List>
    </div>
  );
};

export default withDataHandler(Menu);
