import { makeStyles } from "@material-ui/core/styles";

const menuButtonStyles = {
  margin: "0px",
  padding: "0px",
  lineHeight: "26px",
  textTransform: "none",
  borderRadius: "0px",
  "& > .MuiTouchRipple-root": { borderRadius: "0px" }
};

export const systemBarStyles = debugMode =>
  makeStyles(theme => ({
    systemBar: {
      background: theme.topBarColor,
      height: "26px",
      borderBottom: debugMode ? "solid 5px purple" : "",
      width: "100%"
    },
    menuButton: {
      ...menuButtonStyles,
      minWidth: "40px",
      color: theme.palette.grey[200],
      "&:hover": {
        background: theme.palette.grey[900]
      }
    },
    activeMenu: {
      background: theme.palette.grey[900]
    }
  }));

export const systemMenuStyles = makeStyles(theme => ({
  popper: {
    zIndex: 999999
  },
  listHolder: {
    minWidth: "300px",
    borderRadius: "0px 0px 5px 5px",
    background: theme.topBarColor
  },
  list: {
    ...menuButtonStyles
  },
  menuDivider: {
    background: theme.palette.grey[200]
  }
}));

export const systemMenuItemStyles = makeStyles(theme => ({
  listItem: {
    ...menuButtonStyles,
    "&:last-of-type > button": {
      borderRadius: "0px 0px 5px 5px"
    }
  },
  menuButton: {
    ...menuButtonStyles,
    width: "100%",
    justifyContent: "space-between",
    color: theme.palette.grey[200],
    "& > .MuiButton-label": { paddingLeft: "10px" },
    "&:hover": {
      background: theme.palette.grey[900],
      "& > .MuiButton-label > div[class*=subMenuHolder]": {
        opacity: "1",
        maxWidth: "500px"
      }
    }
  },
  icon: {
    verticalAlign: "text-top",
    marginRight: "10px",
    "& > svg": {
      fontSize: "1rem"
    }
  },
  keybind: {
    paddingRight: "10px",
    fontStyle: "italic",
    color: theme.palette.grey[400]
  },
  subMenuHolder: {
    position: "absolute",
    top: "0px",
    right: "0px",
    minWidth: "300px",
    maxWidth: "0px",
    opacity: "0",
    borderRadius: "3px",
    boxShadow: "1px 1px 2px 1px #333",
    background: theme.topBarColor,
    transform: "translate(99%)",
    transition: "opacity .3s, max-width .3s"
  }
}));

export const helpDialogStyles = makeStyles(theme => ({
  movaiIcon: {
    height: "24px",
    verticalAlign: "sub",
    marginRight: "5px"
  },
  contentHolder: {
    "& > p": {
      margin: "0px"
    }
  }
}));
