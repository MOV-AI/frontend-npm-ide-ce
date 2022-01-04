import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { usePluginMethods } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import InfoIcon from "@material-ui/icons/Info";
import withLoader from "../_shared/Loader/withLoader";
import Flow from "./Flow";
import BaseFlow from "./Views/nBaseFlow";

const FlowPlugin = (props, ref) => {
  const { call, name, instance, data } = props;
  console.log("debug plugin props", props);

  const [dataFromDB, setDataFromDB] = useState();

  const id = Math.random();

  const renderRightMenu = React.useCallback(() => {
    //const details = data.details ?? {};
    const menuName = `${id}-detail-menu`;
    // add bookmark
    call("rightDrawer", "setBookmark", {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: <div>Its working {name}</div>
      }
    });
  }, [call, id, name]);

  usePluginMethods(ref, {
    renderRightMenu
  });

  useEffect(() => {
    console.log("debug plugin get instance", instance.current);
    if (instance.current) {
      console.log("debug plugin instance", instance.current);
      const _data = instance.current.serializeToDB();
      console.log("debug plugin instance data", _data);
      setDataFromDB(_data);
    }
  }, [instance, data]);

  return <BaseFlow {...props} id={id} dataFromDB={dataFromDB} />;
};

FlowPlugin.defaultProps = {
  name: "a6"
};

export default withEditorPlugin(FlowPlugin);
