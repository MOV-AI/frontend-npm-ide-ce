import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import ExposedPortLine from "./components/ExposedPortLine";

import { invalidExposedPortsWarningStyles } from "./styles";

const InvalidExposedPortsWarning = props => {
  const { invalidExposedPorts, call, closeModal } = props;

  // Style hooks
  const classes = invalidExposedPortsWarningStyles();
  // Translation hooks
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div
      className={classes.root}
      data-testid="section_invalid-exposed-ports-warning"
    >
      <p>{t("InvalidExposedPortsMessagePre")}</p>
      <div className={classes.invalidExposedPortsHeader}>
        <h5>{t("InvalidExposedPorts")}</h5>
        <h5>{t("NodeTemplate")}</h5>
      </div>
      <div className={classes.invalidExposedPortsMessageHolder}>
        {invalidExposedPorts.map(exposedPortInfo => (
          <ExposedPortLine
            key={exposedPortInfo.nodeInst.data.id}
            closeModal={closeModal}
            exposedPortInfo={exposedPortInfo}
            call={call}
          />
        ))}
      </div>
      <p className={classes.postMessage}>
        {t("InvalidExposedPortsMessagePost")}
      </p>
    </div>
  );
};

InvalidExposedPortsWarning.propTypes = {
  invalidExposedPorts: PropTypes.array.isRequired
};

export default InvalidExposedPortsWarning;
