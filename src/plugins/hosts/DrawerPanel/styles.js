import { makeStyles } from "@material-ui/core/styles";

export const drawerPanelStyles = (isLeft, isOpen) =>
  makeStyles(theme => ({
    content: {
      background: theme.palette.background.primary,
      color: theme.backdrop.color,
      height: "100%",
      display: "flex",
      flexDirection: "column"
    },
    drawer: {
      overflow: "hidden",
      position: "relative",
      [isLeft ? "marginRight" : "marginLeft"]: "auto",
      width: isOpen ? 340 : "auto",
      height: "100%",
      "& .MuiBackdrop-root": {
        display: "none"
      },
      "& .MuiDrawer-paper": {
        width: 340,
        position: "absolute",
        transition: "none !important"
      }
    }
  }));
