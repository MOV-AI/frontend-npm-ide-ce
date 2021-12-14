import React from "react";
import Loader from "../../_shared/Loader/Loader";
import MaterialTree from "../../_shared/MaterialTree/MaterialTree";

const AddImport = props => {
  const { call, scope, onSelectionChange } = props;
  const [loading, setLoading] = React.useState(false);
  const [pyLibs, setPyLibs] = React.useState();

  React.useEffect(() => {
    setLoading(true);
    call("docManager", "getStore", scope).then(store => {
      store.helper.getAllLibraries().then(libs => {
        if (libs) setPyLibs(libs);
        setLoading(false);
      });
    });
  }, [call, scope]);

  /**
   *
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
    console.log("debug onSelect", pyLibSelected);
  };

  /**
   *
   * @returns
   */
  const renderTree = () => {
    // Return loader if data is not ready
    if (loading) return <Loader />;
    // Return when data is ready or error message if not
    return pyLibs ? (
      <MaterialTree data={pyLibs} onNodeSelect={onSelectLib}></MaterialTree>
    ) : (
      <h2>Something went wrong :(</h2>
    );
  };

  return renderTree();
};

export default AddImport;
