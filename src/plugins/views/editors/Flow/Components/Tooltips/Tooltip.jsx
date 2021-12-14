import React, { Component } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { Divider } from "@material-ui/core";
import _get from "lodash/get";
import BasePort from "../Nodes/BaseNode/BasePort";

const styles = theme => ({
  root: {
    opacity: 0.9
  }
});

class Tooltip extends Component {
  constructor(props) {
    super(props);
    this.domNode = this.props.domNode;
    this.el = document.createElement("div");
    // Update position
    this.el.style.position = "absolute";
    this.el.style.left = `${20}px`;
    this.el.style.bottom = `${20}px`;
    // Update tooltip width
    this.updateEl();
    // Append to screen
    this.domNode.current.appendChild(this.el);
  }

  state = {
    open: false,
    name: "", // port name
    message: "", // port message
    template: "", // port transport/protocol
    callback: "" // port callback
  };

  updateEl = () => {
    this.domNode = this.props.domNode;

    const setWidth =
      this.state.name.length > 35 ||
      this.state.message.length > 35 ||
      this.state.template.length > 35 ||
      this.state.callback.length > 35
        ? "30rem"
        : "20rem";

    this.el.style.width = setWidth;
  };

  parsePortName = name => BasePort.parsePortname(name);

  handleOpen = (port, open) => {
    const content = _get(port, "data", {
      name: "",
      message: "",
      template: "",
      callback: ""
    });

    const { name, message, template, callback } = content;

    this.setState((state, props) => {
      return {
        open,
        name,
        message,
        template,
        callback
      };
    });
  };

  componentDidUpdate() {
    this.updateEl();
  }

  getRows = () => {
    const { name, message, template, callback } = this.state;
    const leftSize = 4;
    const rightSize = 8;

    let data = [
      { value: "Name", size: leftSize },
      { value: name, size: rightSize },
      { value: "Message", size: leftSize },
      { value: message, size: rightSize },
      { value: "Protocol", size: leftSize },
      { value: template, size: rightSize }
    ];

    if (!!callback) {
      data = [
        ...data,
        { value: "Callback", size: leftSize },
        { value: callback, size: rightSize }
      ];
    }

    return data.map((row, index) => {
      return (
        <React.Fragment key={"tooltip-fragment-row-" + index}>
          <Grid item xs={row.size}>
            <Typography variant="caption" color="textSecondary" component="p">
              {row.value}
            </Typography>
          </Grid>
        </React.Fragment>
      );
    });
  };

  createTooltip = () => {
    const { classes } = this.props;
    const { open } = this.state;

    return (
      <Card
        className={classes.root}
        onMouseLeave={() => this.handleOpen("", false)}
      >
        {open && (
          <CardContent className="portTooltip">
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  component="p"
                >
                  Port
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {this.getRows()}
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
