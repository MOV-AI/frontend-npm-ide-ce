import React from "react";
import PropTypes from "prop-types";
import { usePluginMethods } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import InfoIcon from "@material-ui/icons/Info";
import Flow from "./Flow";

const FlowPlugin = (props, ref) => {
  const { call } = props;
  const name = "dummy";
  const id = Math.random();
  const data = {};

  const renderRightMenu = React.useCallback(() => {
    const details = data.details ?? {};
    const menuName = `${id}-detail-menu`;
    // add bookmark
    call("rightDrawer", "setBookmark", {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: <div>Its working {name}</div>
      }
    });
  }, [call, id, name, data.details]);

  usePluginMethods(ref, {
    renderRightMenu
  });

  return <Flow></Flow>;
};

export default withEditorPlugin(FlowPlugin);
