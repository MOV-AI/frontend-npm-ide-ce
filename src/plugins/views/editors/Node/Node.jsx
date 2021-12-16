import React from "react";
import PropTypes from "prop-types";
import Model from "../../../../models/Node/Node";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { usePluginMethods } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import InfoIcon from "@material-ui/icons/Info";
import Menu from "./Menu";
import Description from "./components/Description/Description";
import Loader from "../_shared/Loader/Loader";
import ExecutionParameters from "./components/ExecutionParameters/ExecutionParameters";

const useStyles = makeStyles(theme => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  container: {
    flexGrow: 1,
    padding: "15px",
    overflowY: "auto"
  }
}));

const Node = (props, ref) => {
  const {
    id,
    name,
    call,
    instance,
    data = new Model({}).serialize(),
    editable = true
  } = props;
  // Style Hooks
  const classes = useStyles();
  // State Hooks
  const [loading, setLoading] = React.useState(true);

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  const renderRightMenu = React.useCallback(() => {
    const details = data.details ?? {};
    const menuName = `${id}-detail-menu`;
    // add bookmark
    call("rightDrawer", "setBookmark", {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: <Menu id={id} name={name} details={details}></Menu>
      }
    });
  }, [call, id, name, data.details]);

  usePluginMethods(ref, {
    renderRightMenu
  });

  React.useEffect(() => {
    console.log("debug data changed", data);
    if (data.id && loading) setLoading(false);
  }, [data, loading]);

  //========================================================================================
  /*                                                                                      *
   *                                 Document Functions                                   *
   *                                                                                      */
  //========================================================================================

  const updateDescription = value => {
    if (instance.current) instance.current.setDescription(value);
  };

  const updateExecutionParams = (param, value) => {
    if (instance.current) instance.current.setExecutionParameter(param, value);
  };

  const updatePath = value => {
    if (instance.current) instance.current.setPath(value);
  };

  //========================================================================================
  /*                                                                                      *
   *                                   Render Functions                                   *
   *                                                                                      */
  //========================================================================================

  const renderEditor = () => {
    if (loading) return <Loader />;
    return (
      <Typography component="div" className={classes.container}>
        <Description
          onChangeDescription={updateDescription}
          editable={editable}
          nodeType={data.type}
          value={data.description}
        ></Description>
        <ExecutionParameters
          path={data.path}
          remappable={data.remappable}
          persistent={data.persistent}
          launch={data.launch}
          onChangePath={updatePath}
          onChangeExecutionParams={updateExecutionParams}
        />
      </Typography>
    );
  };

  return (
    <Typography component="div" className={classes.root}>
      {renderEditor()}
    </Typography>
  );
};

export default withEditorPlugin(Node);
export { Node as NodeComponent };

Node.scope = "Node";

Node.propTypes = {
  profile: PropTypes.object.isRequired,
  data: PropTypes.object,
  editable: PropTypes.bool,
  alert: PropTypes.func
};
