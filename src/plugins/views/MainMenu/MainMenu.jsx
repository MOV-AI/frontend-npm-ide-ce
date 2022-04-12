import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext
} from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import {
  VerticalBar,
  ProfileMenu,
  ContextMenu
} from "@mov-ai/mov-fe-lib-react";
import { Authentication } from "@mov-ai/mov-fe-lib-core";
import TextSnippetIcon from "@material-ui/icons/Description";
import AddBoxIcon from "@material-ui/icons/AddBox";
import { Tooltip } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { MainContext } from "../../../main-context";
import { APP_INFORMATION, PLUGINS, HOSTS } from "../../../utils/Constants";
import { getIconByScope } from "../../../utils/Utils";
import movaiIcon from "../editors/_shared/Branding/movai-logo-transparent.png";

import { mainMenuStyles } from "./styles";

const MainMenu = props => {
  const { call } = props;
  // State hooks
  const [docTypes, setDocTypes] = useState([]);
  // Other hooks
  const classes = mainMenuStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const { isDarkTheme, handleLogOut, handleToggleTheme } =
    useContext(MainContext);
  // Refs
  const MENUS = useRef([
    {
      name: PLUGINS.EXPLORER.NAME,
      icon: _props => <TextSnippetIcon {..._props}></TextSnippetIcon>,
      title: "Explorer",
      isActive: true,
      getOnClick: () => {
        // Toggle left drawer
        call(HOSTS.LEFT_DRAWER.NAME, HOSTS.LEFT_DRAWER.CALL.TOGGLE);
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
              call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.CREATE, {
                scope: docType.scope
              }).then(document => {
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
      navigationList={MENUS.current.map(menu => (
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
          version={APP_INFORMATION.VERSION}
          userName={Authentication.getTokenData().message.name ?? ""}
          isDarkTheme={isDarkTheme}
          handleLogout={handleLogoutClick}
          handleToggleTheme={handleToggleTheme}
        />,
        <img
          key={"movaiIcon"}
          src={movaiIcon}
          className={classes.movaiIcon}
          alt="MOV.AI"
        />
      ]}
    ></VerticalBar>
  );
};

MainMenu.propTypes = {
  call: PropTypes.func.isRequired,
  emit: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

export default withViewPlugin(MainMenu);
