import Tooltip from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/core/styles";

export const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: theme.palette.accent.background,
    borderColor: theme.palette.accent.border,
    color: theme.palette.accent.color,
    padding: theme.spacing(1),
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid"
  }
}))(Tooltip);
