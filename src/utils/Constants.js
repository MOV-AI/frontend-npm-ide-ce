import get from "lodash/get";

export const MANAGER = "manager";

export const VERSION = get(window, "SERVER_DATA.Application.Version", "0.0.1");

export const SCOPES = {
  Callback: "Callback",
  Configuration: "Configuration",
  Flow: "Flow",
  Node: "Node"
};
