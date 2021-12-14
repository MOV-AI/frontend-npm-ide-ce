import React, { Component } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

const styles = theme => ({
  root: {
    opacity: 0.9,
    backgroundColor: theme.palette.background.secondary
  },
  tooltip: {
    whiteSpace: "pre"
  }
});

class Tooltip extends Component {
  constructor(props) {
    super(props);
    this.domNode = this.props.domNode;
    this.el = document.createElement("div");
    // Update position
    this.el.style.position = "absolute";
    // Update tooltip width
    this.updateEl();
    // Append to screen
    this.domNode.current.appendChild(this.el);
  }

  state = {
    open: false,
    message: "" // tooltip text
  };

  updateEl = () => {
    this.domNode = this.props.domNode;
  };

  handleOpen = (data, open) => {
    const text = data.message;

    if (open) {
      this.el.style.left = `${data.position.x - 50}px`;
      this.el.style.top = `${data.position.y - 100}px`;
    }

    this.setState({
      open,
      message: text
    });
  };

  componentDidUpdate() {
    this.updateEl();
  }

  createTooltip = () => {
    const { classes } = this.props;
    const { open, message } = this.state;

    return (
      <Card className={classes.root}>
        {open && (
          <CardContent className={classes.tooltip}>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  component="p"
                >
                  {message}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        )}
      </Card>
    );
  };

  render() {
    return createPortal(this.createTooltip(), this.el);
  }
}

Tooltip.propTypes = {
  domNode: PropTypes.object.isRequired,
  classes: PropTypes.object,
  theme: PropTypes.object
};

Tooltip.defaultProps = {
  classes: {},
  theme: {}
};

export default withStyles(styles, { withTheme: true })(Tooltip);
