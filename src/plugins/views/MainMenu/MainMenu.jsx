import React, { useState, useEffect, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import {
  VerticalBar,
  ProfileMenu,
  ContextMenu
} from "@mov-ai/mov-fe-lib-react";
import TextSnippetIcon from "@material-ui/icons/Description";
import AddBoxIcon from "@material-ui/icons/AddBox";
import { Tooltip } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { MainContext } from "../../../main-context";
import AppSettings from "../../../App/AppSettings";
import { PLUGINS, HOSTS } from "../../../utils/Constants";
import { getMainMenuTools } from "../../../tools";
import { getIconByScope } from "../../../utils/Utils";
import movaiIcon from "../../../Branding/movai-logo-transparent.png";

import { mainMenuStyles } from "./styles";
import { openTool } from "../SystemBar/builder/buildFunctions";

const MainMenu = props => {
  const { call } = props;
  // State hooks
  const [docTypes, setDocTypes] = useState([]);
  // Other hooks
  const classes = mainMenuStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const { isDarkTheme, handleLogOut } = useContext(MainContext);
  // Refs
  const MENUS = [
    {
      name: PLUGINS.EXPLORER.NAME,
      icon: _props => <TextSnippetIcon {..._props}></TextSnippetIcon>,
      title: "Explorer",
      isActive: true,
      getOnClick: () => {
        // Toggle left drawer
        call(HOSTS.LEFT_DRAWER.NAME, HOSTS.LEFT_DRAWER.CALL.TOGGLE);
      }
    },
    ...getMainMenuTools().map(tool => {
      const Icon = tool.icon;
      return {
        name: tool.id,
        icon: _props => <Icon {..._props} />,
        title: tool.profile.title,
        isActive: true,
        getOnClick: () => {
          // Open tool
          openTool(call, tool.profile.name);
        }
      };
    })
  ];

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  // To run when component is initiated
  useEffect(() => {
    call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.GET_DOC_TYPES).then(
      _docTypes => {
        setDocTypes(_docTypes);
      }
    );
  }, [call]);

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  const handleLogoutClick = useCallback(
    () => handleLogOut(window.location.href),
    [handleLogOut]
  );

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div className={classes.mainMenuHolder} data-testid="section_main-menu">
      <VerticalBar
        unsetAccountAreaPadding={true}
        backgroundColor={theme.palette.background.default}
        upperElement={
          <ContextMenu
            element={
              <Tooltip title={t("CreateNewDoc")} placement="right" arrow>
                <AddBoxIcon
                  id="mainMenuCreateNewDocument"
                  className={classes.icon}
                ></AddBoxIcon>
              </Tooltip>
            }
            menuList={docTypes.map(docType => ({
              onClick: () =>
                call(
                  PLUGINS.DOC_MANAGER.NAME,
                  PLUGINS.DOC_MANAGER.CALL.CREATE,
                  {
                    scope: docType.scope
                  }
                ).then(document => {
                  call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
                    id: document.getUrl(),
                    name: document.getName(),
                    scope: docType.scope,
                    isNew: true
                  });
                }),
              element: docType.scope,
              icon: getIconByScope(docType.scope),
              onClose: true
            }))}
          ></ContextMenu>
        }
        navigationList={MENUS.map(menu => (
          <Tooltip key={menu.name} title={menu.title} placement="right" arrow>
            {menu.icon({
              className: classes.icon,
              onClick: () => menu.getOnClick()
            })}
          </Tooltip>
        ))}
        lowerElement={[
          <ProfileMenu
            key={"profileMenu"}
            version={AppSettings.APP_INFORMATION.VERSION}
            isDarkTheme={isDarkTheme}
            handleLogout={handleLogoutClick}
          />,
          <img
            key={"movaiIcon"}
            src={movaiIcon}
            className={classes.movaiIcon}
            alt="MOV.AI"
          />
        ]}
      ></VerticalBar>
    </div>
  );
};

MainMenu.propTypes = {
  call: PropTypes.func.isRequired,
  emit: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

export default withViewPlugin(MainMenu);
