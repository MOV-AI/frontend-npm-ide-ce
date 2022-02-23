import { Themes } from "@mov-ai/mov-fe-lib-react";
import lodash from "lodash";

const commonColors = {
  black: "#000000",
  white: "#ffffff"
};

const overrides = {
  MuiAppBar: {
    positionStatic: {
      zIndex: 10
    }
  }
};

const overrideTheme = {
  // Override dark theme
  dark: {
    commonColors,
    background: commonColors.black,
    topBarColor: Themes.dark.palette.background.secondary,
    backdrop: {
      color: Themes.dark.textColor,
      background: Themes.dark.palette.background.secondary
    },
    saveBar: { backgroundColor: Themes.dark.palette.background.secondary },
    nodeEditor: { backgroundColor: "#292929", stripeColor: "#3b3b3b" },
    robotDetails: {
      interfaceColor: Themes.dark.palette.background.primary,
      backgroundColor: "#292929",
      stripeColor: "#3b3b3b"
    },
    codeEditor: { theme: "vs-dark" },
    flowEditor: {
      interfaceColor: Themes.dark.palette.background.primary
    },
    diffTool: {
      background: "#505050",
      removedBackground: "#632F34",
      addedBackground: "#044B53",
      color: "#24292e",
      jsonEditor: {
        background: "#363946",
        color: Themes.dark.textColor,
        readOnly: "#acacac"
      }
    },
    layoutEditor: {
      background: Themes.dark.palette.background.secondary,
      gridItemDev: "#ffdeb7",
      gridItemPreview: commonColors.white,
      itemBoxColor: "#969696",
      itemBoxColorHover: commonColors.white
    }
  },
  // Override light theme
  light: {
    commonColors,
    background: Themes.light.palette.background.primary,
    topBarColor: Themes.light.palette.background.secondary,
    backdrop: {
      color: Themes.light.textColor,
      background: Themes.light.palette.background.secondary
    },
    saveBar: { backgroundColor: Themes.light.palette.background.secondary },
    nodeEditor: {
      backgroundColor: "whitesmoke",
      stripeColor: "#cfcfcf"
    },
    robotDetails: {
      interfaceColor: "#afafaf",
      backgroundColor: "whitesmoke",
      stripeColor: "#cfcfcf"
    },
    flowEditor: {
      interfaceColor: "#afafaf"
    },
    layoutEditor: {
      background: Themes.light.palette.background.primary,
      gridItemDev: "lightgrey",
      gridItemPreview: commonColors.white,
      itemBoxColor: "#3e3e3e",
      itemBoxColorHover: commonColors.black
    },
    diffTool: {
      background: Themes.light.palette.background.secondary,
      removedBackground: "#ffdce0",
      addedBackground: "#cdffd8",
      color: "#24292e",
      jsonDiff: { color: "#4a6b08" },
      jsonEditor: {
        background: "lightslategray",
        color: Themes.light.textColor,
        readOnly: "#d8d6d6"
      }
    },
    codeEditor: { theme: "light" }
  }
};

// add common component overrides for all themes
Object.keys(overrideTheme).forEach(theme => {
  overrideTheme[theme].overrides = {
    ...(overrideTheme[theme].overrides ?? {}),
    ...overrides
  };
});
// Merge app theme with base theme
const mergedTheme = lodash.merge(Themes, overrideTheme);
export const ApplicationTheme = mergedTheme;
