// import { makeStyles } from "@mui/styles";
import PropTypes from "prop-types";
import DockLayout from "rc-dock";
import "rc-dock/dist/rc-dock.css";
import React from "react";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";

// const useStyles = makeStyles(() => ({
//   icon: {
//     color: "primary",
//     "&:hover": {
//       cursor: "pointer"
//     }
//   }
// }));

const defaultLayout = {
  dockbox: {
    mode: "horizontal",
    children: [
      {
        tabs: [{ id: "tab1", title: "tab1", content: <div>Hello World</div> }]
      }
    ]
  }
};

const Tabs = ({ profile, call }) => {
  //   const classes = useStyles();
  return <DockLayout defaultLayout={defaultLayout} />;
};

export default withViewPlugin(Tabs);

Tabs.propTypes = {
  call: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired,
  emit: PropTypes.func.isRequired,
  onTabs: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

Tabs.defaultProps = {
  profile: { name: "explorer" }
};
