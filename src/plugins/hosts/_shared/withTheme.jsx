import React, { useState } from "react";
import { ApplicationTheme } from "../../../themes";
import { ThemeProvider } from "@material-ui/styles";

export function withTheme(Component) {
  return function (props) {
    const [theme, setTheme] = useState("dark");

    /**
     * Handle theme toggle
     */
    const handleToggleTheme = () => {
      const newTheme = theme === "dark" ? "light" : "dark";
      ApplicationTheme.setTheme(newTheme);
      setTheme(newTheme);
    };

    /**
     * Update current theme on app start
     */
    React.useEffect(() => {
      const currentTheme = ApplicationTheme.getTheme();
      setTheme(currentTheme);
    }, [theme]);

    return (
      <ThemeProvider theme={ApplicationTheme[theme]}>
        <Component
          handleToggleTheme={handleToggleTheme}
          theme={theme}
          {...props}
        />
      </ThemeProvider>
    );
  };
}
