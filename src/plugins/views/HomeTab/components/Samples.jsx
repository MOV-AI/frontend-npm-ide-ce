import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import HomeTabCard from "./HomeTabCard";

import { samplesDocumentsStyles } from "../styles";

const HOME_SAMPLES = window.SERVER_DATA?.Samples || [];

const Samples = props => {
  const classes = samplesDocumentsStyles();
  const { openExistingDocument } = props;
  const { t } = useTranslation();

  return (
    <Paper className={`${classes.paper} ${classes.samplePaper}`}>
      <div className={classes.columnTitle}>{t("Samples")}</div>
      <Divider />
      <div className={classes.columnSample}>
        {HOME_SAMPLES?.map((sample, i) => {
          return (
            <div key={sample.title + i}>
              {i !== 0 && (
                <Divider light={true} className={classes.cardDivider} />
              )}
              <HomeTabCard
                sample={sample}
                openDocument={openExistingDocument}
              />
            </div>
          );
        })}
      </div>
    </Paper>
  );
};

Samples.propTypes = {
  openExistingDocument: PropTypes.func,
  on: PropTypes.func
};

export default Samples;
