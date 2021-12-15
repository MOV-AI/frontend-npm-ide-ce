import React from "react";
import Loader from "../../_shared/Loader/Loader";
import MaterialTree from "../../_shared/MaterialTree/MaterialTree";
import Search from "../../_shared/Search/Search";
import _debounce from "lodash/debounce";
import { searchImports } from "./utils";

const AddImport = props => {
  // Props
  const { call, scope, onSelectionChange } = props;
  // State hooks
  const [loading, setLoading] = React.useState(false);
  const [pyLibs, setPyLibs] = React.useState();
  const [filteredLibs, setFilteredLibs] = React.useState();

  //========================================================================================
  /*                                                                                      *
   *                                  React Lifecycle                                     *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    setLoading(true);
    call("docManager", "getStore", scope).then(store => {
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
   * @param {*} selectedLibs
   */
  const onSelectLib = selectedLibs => {
    const pyLibSelected = {};
    selectedLibs.forEach(libPath => {
      const path = libPath.split(".");
      const moduleName = path[0];
      const name = path[path.length - 1];
      if (name === libPath || path.length === 2) {
        pyLibSelected[moduleName] = { Module: moduleName, Class: false };
      } else {
        pyLibSelected[name] = { Module: moduleName, Class: name };
      }
    });
    // Return pyLibSelected
    onSelectionChange(pyLibSelected);
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
      <>
        <Search onSearch={onSearch} />
        <MaterialTree
          data={filteredLibs}
          onNodeSelect={onSelectLib}
          multiSelect={true}
        ></MaterialTree>
      </>
    ) : (
      <>
        <h2>Something went wrong :(</h2>
        <h3>Failed to load libraries</h3>
      </>
    );
  };

  return renderTree();
};

export default AddImport;
