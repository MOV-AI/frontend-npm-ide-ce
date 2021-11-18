import React from "react";

export const MainContext = React.createContext({
  selectedTheme: "dark",
  handleToggleTheme: () => {},
  handleLogOut: () => {}
});
