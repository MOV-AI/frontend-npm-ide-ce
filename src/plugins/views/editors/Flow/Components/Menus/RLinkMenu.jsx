import React, { Component } from "react";
import { Typography, Grid, NativeSelect } from "@material-ui/core";
import {
  FormHelperText,
  FormControl,
  InputLabel,
  Divider
} from "@material-ui/core";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Rest } from "@mov-ai/mov-fe-lib-core";
import MasterComponent from "../../../MasterComponent/MasterComponent";
import { SUCCESS_MESSAGES } from "../../../_shared/constants";
import BasePort from "../Nodes/BaseNode/BasePort";
import { withTranslation } from "react-i18next";
import { TRANSITION_LINK } from "../../Constants/constants";

class RLinkMenu extends Component {
  state = {
    dependency_level: 0
  };

  /**
   * Save link dependency level
   * # link dependencies level
   * # 0: check dependencies in both directions (From and To)
   * # 1: check dependencies only From -> To
   * # 2: check dependencies only To -> From
   * # 3: do not check dependencies
   */
  saveLinkDependency = () => {
    Rest.cloudFunction({
      cbName: "backend.FlowAPI",
      func: "setLinkDependency",
      args: {
        flowId: this.props.uid,
        linkId: this.props.link.id,
        dependency: parseInt(this.state.dependency_level)
      }
    }).then(res => {
      if (res.success) {
        MasterComponent.alert(SUCCESS_MESSAGES.save);
      } else {
        MasterComponent.alert(res.error, "error");
      }
    });
  };

  parsePortname = name => BasePort.parsePortname(name);

  UNSAFE_componentWillReceiveProps(newProps) {
    this.setState({ dependency_level: newProps.link.Dependency || 0 });
  }

  componentDidMount() {
    this.setState({ dependency_level: this.props.link.Dependency || 0 });
  }

  onLinkDependencyChange = evt => {
    const value = evt.target.value;
    this.setState({ dependency_level: value });
  };

  render() {
    const { t, link, editable, sourceMessage } = this.props;
    return (
      <Typography style={{ padding: "5px" }}>
        <Card style={{ margin: 10 }}>
          <CardContent>
            <Typography variant="h6" component="h2">
              {t("From")}
            </Typography>
            <Divider />
            <Typography style={{ marginTop: 10 }} color="textSecondary">
              {t("Node")}
            </Typography>
            <Typography
              variant="body2"
              component="p"
              style={{ paddingLeft: "8px" }}
            >
              {link.sourceNode}
            </Typography>
            <Typography style={{ marginTop: 10 }} color="textSecondary">
              {t("Port")}
            </Typography>
            <Typography
              variant="body2"
              component="p"
              style={{ paddingLeft: "8px" }}
            >
              {this.parsePortname(link.sourcePort)}
            </Typography>
          </CardContent>
        </Card>
        <Card style={{ margin: 10 }}>
          <CardContent>
            <Typography variant="h6" component="h2">
              {t("To")}
            </Typography>
            <Divider />
            <Typography style={{ marginTop: 10 }} color="textSecondary">
              {t("Node")}
            </Typography>
            <Typography
              variant="body2"
              component="p"
              style={{ paddingLeft: "8px" }}
            >
              {link.targetNode}
            </Typography>
            <Typography style={{ marginTop: 10 }} color="textSecondary">
              {t("Port")}
            </Typography>
            <Typography
              variant="body2"
              component="p"
              style={{ paddingLeft: "8px" }}
            >
              {this.parsePortname(link.targetPort)}
            </Typography>
          </CardContent>
        </Card>
        {sourceMessage !== TRANSITION_LINK && (
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <Divider />
            <Grid item>
              <FormControl>
                <InputLabel
                  disabled={!editable}
                  shrink
                  htmlFor="dependencies-helper"
                >
                  {t("Dependencies level")}
                </InputLabel>
                <NativeSelect
                  disabled={!editable}
                  native
                  value={this.state.dependency_level}
                  onChange={evt => this.onLinkDependencyChange(evt)}
                  inputProps={{
                    name: "dependencies",
                    id: "dependencies-helper"
                  }}
                  style={{ fontSize: "0.875rem" }}
                >
                  <option value={0}>{t("All dependencies")}</option>
                  <option value={1}>
                    {t("Only From")} {"->"} {t("To")}
                  </option>
                  <option value={2}>
                    {t("Only To")} {"->"} {t("From")}
                  </option>
                  <option value={3}>{t("No dependencies")}</option>
                </NativeSelect>
                <FormHelperText>{t("Checks node dependencies")}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item align-content-xs-flex-end justify-xs-flex-end>
              <Button
                size="small"
                color="primary"
                onClick={() => this.saveLinkDependency()}
                disabled={!editable}
              >
                {t("Save")}
              </Button>
            </Grid>
          </Grid>
        )}
      </Typography>
    );
  }
}
RLinkMenu.propTypes = {
  uid: PropTypes.string.isRequired,
  sourceMessage: PropTypes.string.isRequired,
  link: PropTypes.object.isRequired,
  editable: PropTypes.bool
};

RLinkMenu.defaultProps = {
  editable: true
};

export default withTranslation()(RLinkMenu);
