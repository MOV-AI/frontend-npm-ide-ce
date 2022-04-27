import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Tooltip from "@material-ui/core/Tooltip";

import { invalidParametersWarningStyles } from "./styles";

const InvalidParametersWarning = props => {
  const { invalidContainerParams } = props;

  // Style hooks
  const classes = invalidParametersWarningStyles();
  // Translation hooks
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Builds the tooltip title
   * @param {String} node
   * @param {String} port
   * @returns {JSX} build title
   */
  const buildTooltipTitle = (node, params) => {
    return (
      <p>
        <strong>{t("Node-Colon")}</strong> {node}
        <br />
        <strong>{t("Parameters-Colon")}</strong> {params.join(", ")}
      </p>
    );
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <>
      <p>{t("InvalidContainersParamMessagePre")}</p>
      <div className={classes.invalidParametersHeader}>
        <h5>{t("Node")}</h5>
        <h5>{t("Parameters")}</h5>
      </div>
      {invalidContainerParams.map(nodeInfo => (
        <Tooltip
          key={nodeInfo.id}
          title={buildTooltipTitle(nodeInfo.name, nodeInfo.invalidParams)}
        >
          <div className={classes.invalidParameterHolder}>
            <div>
              <strong>{nodeInfo.name}</strong>
            </div>
            <div>
              {nodeInfo.invalidParams.map(param => (
                <p key={param}>
                  <strong>{param}</strong>
                </p>
              ))}
            </div>
          </div>
        </Tooltip>
      ))}
      <p className={classes.postMessage}>
        {t("InvalidContainersParamMessagePost")}
      </p>
    </>
  );
};

InvalidParametersWarning.propTypes = {
  invalidContainerParams: PropTypes.array.isRequired
};

export default InvalidParametersWarning;
