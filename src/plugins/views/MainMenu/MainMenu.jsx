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
  const { call } = props;
  // State hooks
  const [docTypes, setDocTypes] = useState([]);
  // Other hooks
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  // Refs
  const MENUS = useRef([
    {
      name: HOMETAB_PROFILE.name,
      icon: _props => <HomeIcon {..._props}></HomeIcon>,
      title: t("Get Started"),
      isActive: true,
      getOnClick: () => {
        getHomeTab().then(homeTab => {
          call("tabs", "open", homeTab);
        });
      }
    },
    {
      name: "explorer",
      icon: _props => <TextSnippetIcon {..._props}></TextSnippetIcon>,
      title: "Explorer",
      isActive: true,
      getOnClick: () => {
        // Toggle left drawer
        call("leftDrawer", "toggle");
      }
    }
  ]);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  // To run when component is initiated
  useEffect(() => {
    call("docManager", "getDocTypes").then(_docTypes => {
      setDocTypes(_docTypes);
    });
  }, [call]);

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle click in home icon
   */
  const handleHomeIconClick = () => {
    window.location.href = "/";
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

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
                onClick: () => menu.getOnClick()
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
