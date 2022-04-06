import { makeStyles } from "@material-ui/core/styles";

export const materialTableStyles = makeStyles(_ => ({
  tableContainer: {
    "& .MuiPaper-root": {
      boxShadow: "none",
      justifyContent: "center"
    }
  }
}));
