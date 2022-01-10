import get from "lodash/get";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import BuildIcon from "@material-ui/icons/Build";
import CodeIcon from "@material-ui/icons/Code";
import DescriptionIcon from "@material-ui/icons/Description";
import DeviceHubIcon from "@material-ui/icons/DeviceHub";
import movaiIcon from "../plugins/views/editors/_shared/Loader/movai_red.svg";

export const APP_DEFAULT_CONFIG = "app-ide-ce";
export const APP_CUSTOM_CONFIG = "app-custom-ide-ce";

export const MANAGER = "manager";

export const VERSION = get(window, "SERVER_DATA.Application.Version", "0.0.1");

export const SCOPES = {
  Callback: "Callback",
  Configuration: "Configuration",
  Flow: "Flow",
  Node: "Node"
};

export const getIconByScope = {
  Callback: style => <CodeIcon style={{ ...style, color: "cadetblue" }} />,
  Layout: style => (
    <i
      className={`icon-Layouts`}
      style={{ ...style, color: "darkred" }}
    ></i>
  ),
  Flow: style => <AccountTreeIcon style={{ ...style, color: "orchid" }} />,
  Annotation: style => <DescriptionIcon style={{ ...style }} />,
  GraphicScene: style => <DeviceHubIcon style={{ ...style }} />,
  Node: style => (
    <i className={`icon-Nodes`} style={{ ...style, color: "khaki" }}></i>
  ),
  Configuration: style => (
    <BuildIcon style={{ ...style, color: "goldenrod" }} />
  ),
  HomeTab: style => (
      <img
        src={movaiIcon}
        alt="MOV.AI Logo"
        style={{ ...style, maxWidth: 12}}
      />
  ),
  Default: <></>
};
