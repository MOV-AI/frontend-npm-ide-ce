import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import {
  VerticalBar,
  ProfileMenu,
  ContextMenu
} from "@mov-ai/mov-fe-lib-react";
import { Authentication } from "@mov-ai/mov-fe-lib-core";
import HomeIcon from "@material-ui/icons/Home";
import TextSnippetIcon from "@material-ui/icons/Description";
import AppsIcon from "@material-ui/icons/Apps";
import AddBoxIcon from "@material-ui/icons/AddBox";
import { Tooltip } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { MainContext } from "../../../main-context";
import { HOMETAB_PROFILE, VERSION } from "../../../utils/Constants";
import { getIconByScope, getHomeTab } from "../../../utils/Utils";

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.primary.main,
    cursor: "pointer",
    "& svg": {
      color: theme.palette.primary.main
    }
  }
}));

const MainMenu = props => {
  const { call, emit } = props;
  // State hooks
  const [docTypes, setDocTypes] = useState([]);
  // Other hooks
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const MENUS = useRef([
    {
      name: HOMETAB_PROFILE.name,
      icon: props => <HomeIcon {...props}></HomeIcon>,
      title: t("Reopen Welcome Tab"),
      isActive: true,
      getOnClick: (call, emit) => {
        getHomeTab().then(homeTab => {
          call("tabs", "open", homeTab);
        });
      }
    },
    {
      name: "explorer",
      icon: props => <TextSnippetIcon {...props}></TextSnippetIcon>,
      title: "Explorer",
      isActive: true,
      getOnClick: (call, emit) => {
        // Toggle left drawer
        call("leftDrawer", "toggle");
      }
    }
    // {
    //   name: "fleet",
    //   icon: props => <AndroidIcon {...props}></AndroidIcon>,
    //   title: "Fleet",
    //   getOnClick: (call, emit) => () => {
    //     // TODO: Open Fleet tab
    //     console.log("debug open Fleet");
    //   }
    // },
    // {
    //   name: "debug",
    //   icon: props => <BugReportIcon {...props}></BugReportIcon>,
    //   title: "Debug",
    //   getOnClick: (call, emit) => () => {
    //     // TODO: Open Debug options
    //     console.log("debug open Debug");
    //   }
    // },
    // {
    //   name: "diff",
    //   icon: props => <CompareIcon {...props}></CompareIcon>,
    //   title: "Diff tool",
    //   getOnClick: (call, emit) => () => {
    //     // TODO: Open DiffTool
    //     console.log("debug open Diff Tool");
    //   }
    // }
  ]);

  useEffect(() => {
    call("docManager", "getDocTypes").then(_docTypes => {
      setDocTypes(_docTypes);
    });
  }, [call]);

  /**
   * Handle click in home icon
   */
  const handleHomeIconClick = () => {
    window.location.href = "/";
  };

  return (
    <MainContext.Consumer>
      {({ isDarkTheme, handleLogOut, handleToggleTheme }) => (
        <VerticalBar
          useDividers={true}
          unsetAccountAreaPadding={true}
          backgroundColor={theme.palette.background.default}
          upperElement={
            <Tooltip title="Apps" placement="right" arrow>
              <AppsIcon
                className={classes.icon}
                onClick={handleHomeIconClick}
              ></AppsIcon>
            </Tooltip>
          }
          creatorElement={
            <ContextMenu
              element={
                <Tooltip title="Create new document" placement="right" arrow>
                  <AddBoxIcon className={classes.icon}></AddBoxIcon>
                </Tooltip>
              }
              menuList={docTypes.map(docType => ({
                onClick: () =>
                  call("docManager", "create", { scope: docType.scope }).then(
                    document => {
                      call("tabs", "openEditor", {
                        id: document.getUrl(),
                        name: document.getName(),
                        scope: docType.scope,
                        isNew: true
                      });
                    }
                  ),
                element: docType.scope,
                icon: getIconByScope(docType.scope),
                onClose: true
              }))}
            ></ContextMenu>
          }
          navigationList={MENUS.current.map(menu => (
            <Tooltip title={menu.title} placement="right" arrow>
              {menu.icon({
                className: classes.icon,
                onClick: () => menu.getOnClick(call, emit)
              })}
            </Tooltip>
          ))}
          lowerElement={
            <ProfileMenu
              version={VERSION}
              userName={Authentication.getTokenData().message.name ?? ""}
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
