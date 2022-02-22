import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
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
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { MainContext } from "../../../main-context";
import movaiIcon from "../editors/_shared/Loader/movai_red.svg";
import movaiIconWhite from "../editors/_shared/Branding/movai-logo-white.png";
import {
  HOMETAB_PROFILE,
  APP_INFORMATION,
  PLUGINS,
  HOSTS
} from "../../../utils/Constants";
import { getIconByScope, getHomeTab } from "../../../utils/Utils";

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.primary.main,
    cursor: "pointer",
    "& svg": {
      color: theme.palette.primary.main
    }
  },
  movaiIcon: {
    padding: 0,
    width: 35,
    height: 35
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
          call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN, homeTab);
        });
      }
    },
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
            <img
              src={theme.label === "dark" ? movaiIconWhite : movaiIcon}
              className={classes.movaiIcon}
              alt="MOV.AI"
            />
          }
          creatorElement={
            <ContextMenu
              element={
                <Tooltip
                  title={t("Create new document")}
                  placement="right"
                  arrow
                >
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
              version={APP_INFORMATION.VERSION}
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
