import PropTypes from "prop-types";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { VerticalBar, ProfileMenu } from "@mov-ai/mov-fe-lib-react";
import BugReportIcon from "@mui/icons-material/BugReport";
import CompareIcon from "@mui/icons-material/Compare";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import { Tooltip } from "@material-ui/core";
import AndroidIcon from "@mui/icons-material/Android";
import { makeStyles } from "@mui/styles";
import React from "react";

const useStyles = makeStyles(() => ({
  icon: {
    color: "primary",
    "&:hover": {
      cursor: "pointer"
    }
  }
}));

const MENUS = [
  {
    name: "explorer",
    icon: props => <TextSnippetIcon {...props}></TextSnippetIcon>,
    title: "Explorer",
    getOnClick: (call, emit) => () => {
      emit("toggle-leftDrawer");
    }
  },
  {
    name: "fleet",
    icon: props => <AndroidIcon {...props}></AndroidIcon>,
    title: "Fleet",
    getOnClick: (call, emit) => () => {
      console.log("debug");
    }
  },
  {
    name: "debug",
    icon: props => <BugReportIcon {...props}></BugReportIcon>,
    title: "Nodes",
    getOnClick: (call, emit) => () => {
      console.log("debug");
    }
  },
  {
    name: "diff",
    icon: props => <CompareIcon {...props}></CompareIcon>,
    title: "Diff tool",
    getOnClick: (call, emit) => () => {
      console.log("debug");
    }
  }
];

const MainMenu = ({ profile, call, emit }) => {
  const classes = useStyles();
  return (
    <VerticalBar
      unsetAccountAreaPadding={true}
      navigationList={MENUS.map(menu => (
        <div>
          <Tooltip title={menu.title}>
            {menu.icon({
              onClick: menu.getOnClick(call, emit),
              color: "primary",
              className: classes.icon
            })}
          </Tooltip>
        </div>
      ))}
      lowerElement={
        <ProfileMenu
          version={"1.2.3"}
          userName={"movai"}
          isDarkTheme={true}
          handleLogout={() => {}}
          handleToggleTheme={() => {}}
        />
      }
    ></VerticalBar>
  );
};

export default withViewPlugin(MainMenu);

MainMenu.propTypes = {
  call: PropTypes.func.isRequired,
  emit: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

MainMenu.defaultProps = {
  profile: { name: "mainMenu" }
};
