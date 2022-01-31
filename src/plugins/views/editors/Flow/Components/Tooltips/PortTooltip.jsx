import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { Divider } from "@material-ui/core";
import PortTooltipContent from "./PortTooltipContent";

const SIZES = {
  DEFAULT: "20rem",
  CUSTOM: "30rem"
};

const PortTooltip = props => {
  const { t } = useTranslation();
  const { anchorPosition, port } = props;
  const open = Boolean(anchorPosition);
  const title = t("Port");

  const getRows = useCallback(() => {
    const { name, message, template, callback } = port.data;

    return (
      <PortTooltipContent
        name={name}
        message={message}
        template={template}
        callback={callback}
      />
    );
  }, [port]);

  const getSize = useCallback(() => {
    const textLengths = ["name", "message", "template", "callback"].map(
      value => {
        return port?.data[value]?.length ?? 0;
      }
    );

    const size = Math.max(...textLengths) > 30 ? SIZES.CUSTOM : SIZES.DEFAULT;

    return size;
  }, [port]);

  return (
    <Card
      style={{ position: "absolute", width: getSize(), ...anchorPosition }}
      open={open}
    >
      <CardContent>
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Typography variant="caption" color="textSecondary" component="p">
              {title}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          {getRows()}
        </Grid>
      </CardContent>
    </Card>
  );
};

PortTooltip.propTypes = {
  anchorPosition: PropTypes.shape({
    left: PropTypes.number,
    top: PropTypes.number
  }).isRequired,
  port: PropTypes.object.isRequired
};

PortTooltip.defaultProps = {};

export default PortTooltip;
