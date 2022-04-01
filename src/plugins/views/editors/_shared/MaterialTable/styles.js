import { makeStyles } from "@material-ui/core/styles";

const materialTableStyles = makeStyles(theme => ({
  tableContainer: {
    "& .MuiPaper-root": {
      boxShadow: "none",
      justifyContent: "center"
    }
  }
}));

export default materialTableStyles;
