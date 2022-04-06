import { makeStyles } from "@material-ui/core/styles";

export const loaderStyles = makeStyles(_ => ({
  root: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    maxHeight: "100%",
    minHeight: "300px",
    position: "relative"
  },
  loaderContainer: {
    height: "100%",
    position: "absolute",
    textAlign: "center",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1051 // Must be greater than 1050 to be on top of floating buttons
  },
  loaderImage: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)"
  },
  linearProgress: { marginTop: 20 }
}));
