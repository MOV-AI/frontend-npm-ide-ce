import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import LinkIcon from "@material-ui/icons/Link";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";

import { systemMenuItemStyles } from "../styles";

const MenuItem = ({ item, closeMenu }) => {
  const { id, title, icon, callback, keybind, externalLink, data } = item;
  const classes = systemMenuItemStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Renders a subMenu with give data
   * @param {Promise} subMenuData : A promise with the subMenu data
   */
  const renderSubMenu = useCallback(() => {
    return (
      <ul className={classes.subMenuHolder}>
        {data.map(subItem => {
          if (subItem.id) {
            return (
              <MenuItem key={subItem.id} item={subItem} closeMenu={closeMenu} />
            );
          } else {
            return <Divider className={classes.menuDivider} />;
          }
        })}
      </ul>
    );
  }, [classes, data, closeMenu]);

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handles Option Click
   * @param {*} evt : Event
   */
  const handleOptionClick = useCallback(
    evt => {
      callback && callback(evt);
      closeMenu(evt);
    },
    [callback, closeMenu]
  );

  return (
    <ListItem className={classes.listItem} key={id}>
      {data ? (
        <div className={classes.menuButton}>
          <span className="MuiButton-label">
            {icon && <span className={classes.icon}>{icon}</span>}
            {t(title)}
            <>
              <ArrowRightIcon></ArrowRightIcon>
              {renderSubMenu()}
            </>
          </span>
        </div>
      ) : (
        <Button className={classes.menuButton} onClick={handleOptionClick}>
          <span>
            {icon && <span className={classes.icon}>{icon}</span>}
            {t(title)}
          </span>
          {keybind && <span className={classes.keybind}>{keybind}</span>}
          {externalLink && <LinkIcon className={classes.keybind}></LinkIcon>}
        </Button>
      )}
    </ListItem>
  );
};

export default MenuItem;

MenuItem.propTypes = {
  item: PropTypes.object.isRequired
};
