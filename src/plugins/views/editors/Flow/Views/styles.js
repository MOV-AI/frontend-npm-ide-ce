const styles = theme => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.backdrop.color,
    backgroundColor: theme.backdrop.background,
    position: "absolute",
    height: "100%",
    width: "100%"
  },
  flowContainer: {
    height: "calc(100% - 75px)",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative"
  },
  flowCanvas: {
    width: "100%",
    height: "100%",
    flexGrow: 1
  },
  flowEditor: {
    interfaceColor: theme.palette.background.primary
  }
});

export default styles;
