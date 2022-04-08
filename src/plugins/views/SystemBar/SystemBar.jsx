import React, { useCallback, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import SystemMenu from "./Components/SystemMenu";
import buildMenus from "./buildMenus";

import { systemBarStyles, helpDialogStyles } from "./styles";

const SystemBar = props => {
  const { debugMode, call } = props;
  // State Hooks
  const [openedMenuId, setOpenedMenuId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [systemMenus, setSystemMenus] = useState(false);

  // Other Hooks
  const classes = systemBarStyles(debugMode)();
  const dialogClasses = helpDialogStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private function to handle the menu close
   */
  const closeMenu = useCallback(evt => {
    const hasMenuId = evt.target.parentElement.dataset?.menuId;
    if (!hasMenuId) {
      setOpenedMenuId(null);
      setAnchorEl(null);
      setMenuOpen(false);
    }
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handler to control the opened menu
   * @param {object} evt
   */
  const handleClickMenu = useCallback(
    evt => {
      setMenuOpen(_prevState => {
        let newState = false;
        let newMenuId = null;
        let newAnchorEl = null;

        if (evt.currentTarget.dataset.menuId !== openedMenuId) {
          newState = true;
          newMenuId = evt.currentTarget.dataset.menuId;
          newAnchorEl = evt.currentTarget;
        }

        setOpenedMenuId(newMenuId);
        setAnchorEl(newAnchorEl);

        return newState;
      });
    },
    [openedMenuId]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Component Did Mount
   */
  useEffect(() => {
    buildMenus(call, dialogClasses).then(data => {
      setSystemMenus(data);
    });
  }, [call, dialogClasses]);

  return (
    <>
      {systemMenus && (
        <div className={classes.systemBar}>
          {systemMenus.map(menu => {
            const activeButtonClass =
              openedMenuId === menu.id ? classes.activeMenu : "";
            return (
              <Button
                key={menu.id}
                className={`${classes.menuButton} ${activeButtonClass}`}
                onClick={handleClickMenu}
                data-menu-id={menu.id}
              >
                {t(menu.title)}
              </Button>
            );
          })}
          {menuOpen && openedMenuId && (
            <SystemMenu
              menuOpen={menuOpen}
              anchorEl={anchorEl}
              data={systemMenus.find(menu => menu.id === openedMenuId)?.data}
              closeMenu={closeMenu}
            />
          )}
        </div>
      )}
    </>
  );
};

export default withViewPlugin(SystemBar);

SystemBar.propTypes = {
  call: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
