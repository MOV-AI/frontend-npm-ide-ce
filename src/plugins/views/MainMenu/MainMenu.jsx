import React from "react";
import PropTypes from "prop-types";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { VerticalBar, ProfileMenu } from "@mov-ai/mov-fe-lib-react";
import { Authentication } from "@mov-ai/mov-fe-lib-core";
import BugReportIcon from "@material-ui/icons/BugReport";
import CompareIcon from "@material-ui/icons/Compare";
import TextSnippetIcon from "@material-ui/icons/Description";
import AndroidIcon from "@material-ui/icons/Android";
import { Tooltip } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { MainContext } from "../../../main-context";
import { VERSION } from "../../../utils/Constants";

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.primary.main,
    cursor: "pointer",
    "& svg": {
      color: theme.palette.primary.main
    }
  }
}));

const MENUS = [
  {
    name: "explorer",
    icon: props => <TextSnippetIcon {...props}></TextSnippetIcon>,
    title: "Explorer",
    isActive: true,
    getOnClick: (call, emit) => () => {
      // Toggle left drawer
      emit("toggle-leftDrawer");
    }
  },
  {
    name: "fleet",
    icon: props => <AndroidIcon {...props}></AndroidIcon>,
    title: "Fleet",
    getOnClick: (call, emit) => () => {
      // TODO: Open Fleet tab
      console.log("debug open Fleet");
    }
  },
  {
    name: "debug",
    icon: props => <BugReportIcon {...props}></BugReportIcon>,
    title: "Debug",
    getOnClick: (call, emit) => () => {
      // TODO: Open Debug options
      console.log("debug open Debug");
    }
  },
  {
    name: "diff",
    icon: props => <CompareIcon {...props}></CompareIcon>,
    title: "Diff tool",
    getOnClick: (call, emit) => () => {
      // TODO: Open DiffTool
      console.log("debug open Diff Tool");
    }
  }
];

const MainMenu = ({ call, emit }) => {
  const classes = useStyles();
  const theme = useTheme();

  const getUser = () => {
    const token = Authentication.getTokenData();
    return token.message.name || "";
  };

  return (
    <MainContext.Consumer>
      {({ isDarkTheme, handleLogOut, handleToggleTheme }) => (
        <VerticalBar
          unsetAccountAreaPadding={true}
          backgroundColor={theme.palette.background.default}
          navigationList={MENUS.map(menu => (
            <div>
              <Tooltip title={menu.title}>
                {menu.icon({
                  className: classes.icon,
                  onClick: menu.getOnClick(call, emit)
                })}
              </Tooltip>
            </div>
          ))}
          lowerElement={
            <ProfileMenu
              version={VERSION}
              userName={getUser()}
              isDarkTheme={isDarkTheme}
              handleLogout={handleLogOut}
              handleToggleTheme={handleToggleTheme}
            />
          }
        ></VerticalBar>
      )}
    </MainContext.Consumer>
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
