import React, { useState, useEffect, useRef, useCallback } from "react";
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
import AddBoxIcon from "@material-ui/icons/AddBox";
import { Tooltip } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { mainMenuStyles } from "./styles";
import { MainContext } from "../../../main-context";
import movaiIcon from "../editors/_shared/Branding/movai-logo-transparent.png";
import { VERSION, PLUGINS } from "../../../utils/Constants";
import { getIconByScope, getHomeTab } from "../../../utils/Utils";

const MainMenu = props => {
  const { call } = props;
  // State hooks
  const [docTypes, setDocTypes] = useState([]);
  // Other hooks
  const classes = mainMenuStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  // Refs
  const MENUS = useRef([
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
   * Open Welcome Tab
   */
  const openHomeTab = useCallback(() => {
    getHomeTab().then(homeTab => {
      call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN, homeTab);
    });
  }, [call]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <MainContext.Consumer>
      {({ isDarkTheme, handleLogOut, handleToggleTheme }) => (
        <VerticalBar
          unsetAccountAreaPadding={true}
          backgroundColor={theme.palette.background.default}
          upperElement={
            <Tooltip title={t("Open Welcome Tab")} placement="right" arrow>
              <HomeIcon
                className={classes.icon}
                onClick={openHomeTab}
              ></HomeIcon>
            </Tooltip>
          }
          navigationList={[
            ...MENUS.current.map(menu => (
              <Tooltip title={menu.title} placement="right" arrow>
                {menu.icon({
                  className: classes.icon,
                  onClick: menu.getOnClick
                })}
              </Tooltip>
            )),
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
          ]}
          lowerElement={[
            <ProfileMenu
              version={VERSION}
              userName={Authentication.getTokenData().message.name ?? ""}
              isDarkTheme={isDarkTheme}
              handleLogout={handleLogOut}
            />,
            <img src={movaiIcon} className={classes.movaiIcon} alt="MOV.AI" />
          ]}
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
