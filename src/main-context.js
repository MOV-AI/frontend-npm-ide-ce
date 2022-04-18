import React from "react";
import { defaultFunction } from "./utils/Utils";

export const MainContext = React.createContext({
  selectedTheme: "dark",
  handleToggleTheme: () => defaultFunction("handleToggleTheme"),
  handleLogOut: () => defaultFunction("handleLogOut")
});
