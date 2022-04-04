import { makeStyles } from "@material-ui/core/styles";

const tabsStyles = makeStyles(theme => ({
  "@global": {
    ".dock-dropdown-menu": {
      background: theme.palette.background.default
    },
    ".dock-dropdown-menu-item": {
      color: theme.palette.text.primary,
      background: theme.palette.background.default
    },
    ".dock-dropdown-menu-item-active:hover": {
      background: theme.palette.background.primary
    }
  },
  root: {
    position: "relative",
    width: "100%",
    height: "100%",
    "& .dock-layout": {
      width: "100%",
      height: "100%",
      background: theme.dockLayout.background,
      "& .dock-panel": {
        background: theme.palette.background.default,
        borderColor: theme.palette.background.default,
        "& .dock-bar": {
          borderColor: theme.background,
          background: theme.palette.background.primary,
          "& .dock-nav-more": {
            color: theme.palette.text.primary
          },
          "& .dock-tab": {
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
            background: theme.backdrop.background,
            color: theme.backdrop.color,
            padding: "0 10px",
            "& .dock-tab-close-btn": {
              right: "1px"
            },
            "& > div": {
              padding: "4px 15px 4px 5px"
            }
          },
          "& .dock-ink-bar": {
            backgroundColor: theme.palette.primary.main
          }
        },
        "& .dock-drop-layer .dock-drop-square": {
          background: theme.palette.background.primary,
          color: theme.backdrop.color,
          borderColor: `${theme.backdrop.color}95`
        }
      },
      "& .dock-style-place-holder": {
        background: theme.palette.background.default
      },
      "& .dock-divider": {
        background: `${theme.palette.background.primary}95`
      }
    }
  },
  dockLayout: {
    position: "absolute",
    left: 10,
    top: 10,
    right: 10,
    bottom: 10
  }
}));

export default tabsStyles;
