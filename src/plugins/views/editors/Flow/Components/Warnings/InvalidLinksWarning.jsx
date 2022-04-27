import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Tooltip from "@material-ui/core/Tooltip";

import { invalidLinksWarningStyles } from "./styles";

const InvalidLinksWarning = props => {
  const { invalidLinks } = props;

  // Style hooks
  const classes = invalidLinksWarningStyles();
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
  const buildTooltipTitle = (node, port) => {
    return (
      <p>
        <strong>{t("Node-Colon")}</strong> {node}
        <br />
        <strong>{t("Port-Colon")}</strong> {port}
      </p>
    );
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div className={classes.invalidLinksMessageHolder}>
      <div className={classes.invalidLinksHeader}>
        <h5>{t("SourcePort")}</h5>
        <h5>{t("TargetPort")}</h5>
      </div>
      {invalidLinks.map(linkInfo => (
        <div key={linkInfo.id} className={classes.invalidLinkHolder}>
          <Tooltip
            title={buildTooltipTitle(linkInfo.sourceNode, linkInfo.sourcePort)}
          >
            <div>
              <p>
                <strong>{linkInfo.sourceNode}</strong>:
              </p>
              {linkInfo.sourcePort}
            </div>
          </Tooltip>
          <Tooltip
            title={buildTooltipTitle(linkInfo.targetNode, linkInfo.targetPort)}
          >
            <div>
              <p>
                <strong>{linkInfo.targetNode}</strong>:
              </p>
              {linkInfo.targetPort}
            </div>
          </Tooltip>
        </div>
      ))}
      <p className={classes.fixMessage}>{t("InvalidLinksFoundMessage")}</p>
    </div>
  );
};

InvalidLinksWarning.propTypes = {
  invalidLinks: PropTypes.array.isRequired
};

export default InvalidLinksWarning;
