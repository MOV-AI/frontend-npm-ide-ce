import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import ParameterLine from "./components/ParameterLine";

import { invalidParametersWarningStyles } from "./styles";

const InvalidParametersWarning = props => {
  const { invalidContainerParams, call, closeModal } = props;

  // Style hooks
  const classes = invalidParametersWarningStyles();
  // Translation hooks
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div testid="section_invalid-parameters-warning">
      <p>{t("InvalidContainersParamMessagePre")}</p>
      <div className={classes.invalidParametersHeader}>
        <Typography variant="h6">{t("InvalidSubFlowParameters")}</Typography>
        <Typography variant="h6">{t("FlowTemplate")}</Typography>
      </div>
      <div className={classes.invalidParametersMessageHolder}>
        {invalidContainerParams.map(subFlowInfo => (
          <ParameterLine
            key={subFlowInfo.id}
            call={call}
            closeModal={closeModal}
            subFlowInfo={subFlowInfo}
          />
        ))}
      </div>
      <p className={classes.postMessage}>
        {t("InvalidContainersParamMessagePost")}
      </p>
    </div>
  );
};

InvalidParametersWarning.propTypes = {
  invalidContainerParams: PropTypes.array.isRequired
};

export default InvalidParametersWarning;
