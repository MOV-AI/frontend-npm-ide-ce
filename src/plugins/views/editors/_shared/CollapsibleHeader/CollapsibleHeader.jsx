import React from "react";
import PropTypes from "prop-types";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Divider from "@material-ui/core/Divider";

import { collapsibleHeaderStyles } from "./styles";

const CollapsibleHeader = props => {
  const {
    title,
    children,
    defaultExpanded,
    testId = "section_accordion"
  } = props;
  const classes = collapsibleHeaderStyles();

  return (
    <Typography data-testid={testId} component="div" className={classes.root}>
      <Accordion defaultExpanded={defaultExpanded}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography component="div" className={classes.column}>
            <Typography className={classes.heading}>{title}</Typography>
          </Typography>
        </AccordionSummary>
        <Divider />
        <AccordionDetails className={classes.details}>
          {children}
        </AccordionDetails>
      </Accordion>
    </Typography>
  );
};

CollapsibleHeader.propTypes = {
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  defaultExpanded: PropTypes.bool
};

CollapsibleHeader.defaultProps = {
  title: <div>Title</div>,
  defaultExpanded: false
};

export default CollapsibleHeader;
