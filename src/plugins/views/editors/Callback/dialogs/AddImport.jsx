import React, { useEffect, useState } from "react";
import _debounce from "lodash/debounce";
import { makeStyles } from "@material-ui/core/styles";
import {
  Dialog,
  DialogContent,
  Button,
  DialogActions
} from "@material-ui/core";
import { PLUGINS } from "../../../../../utils/Constants";
import { withTheme } from "../../../../../decorators/withTheme";
import { DialogTitle } from "../../../../Dialog/components/AppDialog/AppDialog";
import Loader from "../../_shared/Loader/Loader";
import MaterialTree from "../../_shared/MaterialTree/MaterialTree";
import Search from "../../_shared/Search/Search";
import { searchImports } from "./utils";

const useStyles = makeStyles(_ => ({
  paper: {
    minWidth: "40%"
  }
}));

const AddImportDialog = props => {
  // Props
  const { call, scope, onClose, onSubmit } = props;
  // State hooks
  const [loading, setLoading] = useState(false);
  const [pyLibs, setPyLibs] = useState();
  const [filteredLibs, setFilteredLibs] = useState();
  const [selectedLibs, setSelectedLibs] = useState();
  // Style hook
  const classes = useStyles();

  //========================================================================================
  /*                                                                                      *
   *                                  React Lifecycle                                     *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    setLoading(true);
    call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.GET_STORE,
      scope
    ).then(store => {
      store.helper.getAllLibraries().then(libs => {
        if (libs) {
          setPyLibs(libs);
          setFilteredLibs(libs);
        }
        setLoading(false);
      });
    });
  }, [call, scope]);

  //========================================================================================
  /*                                                                                      *
   *                                   Handle Events                                      *
   *                                                                                      */
  //========================================================================================

  /**
   * On chage selected Lib
   * @param {*} _selectedLibs
   */
  const onSelectLib = _selectedLibs => {
    const pyLibSelected = {};
    _selectedLibs.forEach(libPath => {
      const path = libPath.split(".");
      const moduleName = path[0];
      const name = path[path.length - 1];
      if (name === libPath || path.length === 2) {
        pyLibSelected[moduleName] = { module: moduleName, libClass: false };
      } else {
        pyLibSelected[name] = { module: moduleName, libClass: name };
      }
    });
    // Return pyLibSelected
    setSelectedLibs(pyLibSelected);
  };

  /**
   * On search imports
   * @param {*} value
   */
  const onSearch = _debounce(value => {
    const result = searchImports(value, pyLibs);
    setFilteredLibs(result);
  }, 500);

  //========================================================================================
  /*                                                                                      *
   *                                       Render                                         *
   *                                                                                      */
  //========================================================================================

  /**
   * Render Material Tree to select python lib
   * @returns {ReactElement}
   */
  const renderTree = () => {
    // Return loader if data is not ready
    if (loading) return <Loader />;
    // Return when data is ready or error message if not
    return pyLibs ? (
      <MaterialTree
        data={filteredLibs}
        onNodeSelect={onSelectLib}
        multiSelect={true}
      ></MaterialTree>
    ) : (
      <>
        <h2>Something went wrong :(</h2>
        <h3>Failed to load libraries</h3>
      </>
    );
  };

  return (
    <Dialog open={true} onClose={onClose} classes={{ paper: classes.paper }}>
      <DialogTitle onClose={onClose} hasCloseButton={true}>
        Add Import
      </DialogTitle>
      <DialogContent>
        <Search onSearch={onSearch} />
        {renderTree()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="primary"
          onClick={() => {
            onSubmit(selectedLibs);
            onClose();
          }}
          disabled={!selectedLibs}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withTheme(AddImportDialog);
