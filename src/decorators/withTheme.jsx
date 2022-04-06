import React, { forwardRef, useEffect, useState } from "react";
import { ApplicationTheme } from "../themes";
import { ThemeProvider } from "@material-ui/core/styles";

export function withTheme(Component) {
  const RefComponent =
    typeof Component === "function"
      ? forwardRef((props, ref) => Component(props, ref))
      : Component;

  return function (props) {
    const [theme, setTheme] = useState("dark");

    /**
     * Handle theme toggle
     */
    const handleToggleTheme = () => {
      const newTheme = theme === "dark" ? "light" : "dark";
      document.body.classList.remove(theme);
      ApplicationTheme.setTheme(newTheme);
      setTheme(newTheme);
    };

    /**
     * Update current theme on app start
     */
    useEffect(() => {
      const currentTheme = ApplicationTheme.getTheme();
      setTheme(currentTheme);
      // Add new theme class in body
      document.body.classList.add(currentTheme);
      // Set body background color
      document.body.style.backgroundColor =
        ApplicationTheme[currentTheme].background;
    }, [theme]);

    return (
      <ThemeProvider theme={ApplicationTheme[theme]}>
        <RefComponent
          handleToggleTheme={handleToggleTheme}
          theme={theme}
          {...props}
        />
      </ThemeProvider>
    );
  };
}
