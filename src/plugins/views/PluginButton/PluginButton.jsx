import React from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";
import { withPlugin } from "../../../ReactPlugin/ViewReactPlugin";
import PluginManagerIDE from "../../../PluginManagerIDE/PluginManagerIDE";
import PluginLabel from "../PluginLabel/PluginLabel";

const PluginButton = ({ profile, call, random }) => {
  const { name } = profile;
  const pluginName = `${name} props`;
  call("rightPanel", "update", pluginName, {
    random: random.value
  });
  return (
    <Button
      variant="outlined"
      onClick={async () => {
        await PluginManagerIDE.install(
          pluginName,
          new PluginLabel({ name: pluginName, location: "rightPanel" })
        );
        call("rightPanel", "update", pluginName);
      }}
    >
      {random.value} Generate Data {name}
    </Button>
  );
};

export default withPlugin(PluginButton);

PluginButton.propTypes = {
  call: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

PluginButton.defaultProps = {
  random: 0
};
