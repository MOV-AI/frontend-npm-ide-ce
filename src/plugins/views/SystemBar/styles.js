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
      color: theme.palette.grey[900]
    },
    activeMenu: {
      background: theme.palette.grey[400]
    }
  }));

export const systemMenuStyles = makeStyles(theme => ({
  popper: {
    zIndex: 999999
  },
  listHolder: {
    minWidth: "300px",
    borderRadius: "0px 0px 5px 5px",
    background: theme.palette.grey[100],
    overflow: "hidden"
  },
  list: {
    ...menuButtonStyles
  },
  menuDivider: {
    background: theme.palette.grey[400]
  }
}));

export const systemMenuItemStyles = makeStyles(theme => ({
  listItem: {
    ...menuButtonStyles
  },
  menuButton: {
    ...menuButtonStyles,
    width: "100%",
    justifyContent: "space-between",
    color: theme.palette.grey[900],
    "& > .MuiButton-label": { paddingLeft: "10px" },
    "&:hover": {
      background: theme.palette.grey[400]
    }
  },
  keybind: {
    paddingRight: "10px",
    fontStyle: "italic",
    color: theme.palette.grey[600]
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
