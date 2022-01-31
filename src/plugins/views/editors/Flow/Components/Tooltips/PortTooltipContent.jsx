import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const TOOLTIP_INDEX = "tooltip-fragment-row";
const SIZES = {
  LEFT: 4,
  RIGHT: 8
};

const PortTooltipContent = props => {
  const { t } = useTranslation();
  const { name, message, template, callback } = props;
  const text = {
    name: t("Name"),
    message: t("Message"),
    protocol: t("Protocol"),
    callback: t("Callback")
  };

  const data = [
    { text: text.name, size: SIZES.LEFT },
    { text: name, size: SIZES.RIGHT },
    { text: text.message, size: SIZES.LEFT },
    { text: message, size: SIZES.RIGHT },
    { text: text.protocol, size: SIZES.LEFT },
    { text: template, size: SIZES.RIGHT }
  ];

  if (callback) {
    data.push(
      { text: text.callback, size: SIZES.LEFT },
      { text: callback, size: SIZES.RIGHT }
    );
  }

  return data.map((row, index) => {
    return (
      <Grid item xs={row.size} key={`${TOOLTIP_INDEX}-${index}`}>
        <Typography variant="caption" color="textSecondary" component="p">
          {row.text}
        </Typography>
      </Grid>
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
