import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import HomeTabCard from "./HomeTabCard";

import { examplesDocumentsStyles } from "../styles";

const HOME_EXAMPLES = window.SERVER_DATA?.Examples || [];

const Examples = props => {
  const classes = examplesDocumentsStyles();
  const { openExistingDocument } = props;
  const { t } = useTranslation();

  return (
    <Paper className={`${classes.paper} ${classes.examplePaper}`}>
      <div className={classes.columnTitle}>{t("Examples")}</div>
      <Divider />
      <div className={classes.columnExample}>
        {HOME_EXAMPLES?.map((example, i) => {
          return (
            <div key={example.title + i}>
              {i !== 0 && (
                <Divider light={true} className={classes.cardDivider} />
              )}
              <HomeTabCard
                example={example}
                openDocument={openExistingDocument}
              />
            </div>
          );
        })}
      </div>
    </Paper>
  );
};

Examples.propTypes = {
  openExistingDocument: PropTypes.func,
  on: PropTypes.func
};

export default Examples;
