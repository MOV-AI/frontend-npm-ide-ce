import { makeStyles } from "@material-ui/core/styles";

export const materialTableStyles = makeStyles(_theme => ({
  tableContainer: {
    "& .MuiPaper-root": {
      boxShadow: "none",
      justifyContent: "center"
    }
  }
}));
