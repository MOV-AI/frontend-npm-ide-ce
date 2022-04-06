import React from "react";
import { DEFAULT_FUNCTION } from "./utils/Utils";

export const MainContext = React.createContext({
  selectedTheme: "dark",
  handleToggleTheme: () => DEFAULT_FUNCTION("handleToggleTheme"),
  handleLogOut: () => DEFAULT_FUNCTION("handleLogOut")
});
