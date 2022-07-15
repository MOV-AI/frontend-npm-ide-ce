import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import { portTooltipContentStyles } from "./styles";

const ITEMS_INDEX = "tooltip-fragment-row";

const PortTooltipContent = props => {
  const { t } = useTranslation();
  const { name, message, template, callback } = props;
  const classes = portTooltipContentStyles();
  const text = {
    name: t("Name"),
    message: t("Message"),
    protocol: t("Protocol"),
    callback: t("Callback")
  };

  const itemTextProps = {
    variant: "caption",
    className: classes.item
  };

  const data = [
    { primary: text.name, secondary: name },
    { primary: text.message, secondary: message },
    { primary: text.protocol, secondary: template }
  ];

  if (callback) {
    data.push({ primary: text.callback, secondary: callback });
  }

  return data.map(item => {
    return (
      <ListItem
        className={classes.listItem}
        key={`${ITEMS_INDEX}-${item.primary}`}
      >
        <ListItemText
          {...item}
          primaryTypographyProps={itemTextProps}
          secondaryTypographyProps={itemTextProps}
          className={classes.root}
        ></ListItemText>
      </ListItem>
    );
  });
};

PortTooltipContent.propTypes = {
  name: PropTypes.string,
  message: PropTypes.string,
  template: PropTypes.string,
  callback: PropTypes.string
};

PortTooltipContent.defaultProps = {
  name: "",
  message: "",
  template: "",
  callback: null
};

export default PortTooltipContent;
