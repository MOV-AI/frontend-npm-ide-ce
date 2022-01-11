import React, { useEffect, useState } from "react";
import { usePluginMethods } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import InfoIcon from "@material-ui/icons/Info";
import "./Resources/css/Flow.css";
import BaseFlow from "./Views/BaseFlow";
import Menu from "../Configuration/Menu";

const Flow = (props, ref) => {
  const { call, name, instance, data } = props;
  console.log("debug plugin props", props);

  const [dataFromDB, setDataFromDB] = useState();

  const id = Math.random();

  const renderRightMenu = React.useCallback(() => {
    const details = props.data?.details || {};
    const menuName = `${id}-detail-menu`;
    // add bookmark
    call("rightDrawer", "setBookmark", {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: (
          <Menu id={id} name={name} details={details} model={instance}></Menu>
        )
      }
    });
  }, [call, id, name, instance, props.data]);

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

Flow.defaultProps = {
  name: "a6"
};

export default withEditorPlugin(Flow);
