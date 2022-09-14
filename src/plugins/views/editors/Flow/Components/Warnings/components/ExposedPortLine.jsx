import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import { buildDocPath } from "../../../../../../../utils/Utils";
import { PLUGINS } from "../../../../../../../utils/Constants";

import { parameterLineStyles } from "../styles";

const ExposedPortLine = props => {
  const { exposedPortInfo, call, closeModal } = props;

  // Style hooks
  const classes = parameterLineStyles();
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
  const buildTooltipTitle = (template, node, params) => {
    return (
      <>
        <strong>{t("NodeTemplate-Colon")}</strong> {template}
        <br />
        <strong>{t("NodeInstance-Colon")}</strong> {node}
        <br />
        <strong>{t("InvalidExposedPorts-Colon")}</strong>
        <ul>
          {params.map(param => (
            <li key={`${node}_${param}`}>{param}</li>
          ))}
        </ul>
      </>
    );
  };

  //========================================================================================
  /*                                                                                      *
   *                                    Public Methods                                    *
   *                                                                                      */
  //========================================================================================

  const handleOpenDocument = useCallback(() => {
    const name = exposedPortInfo.nodeInst.templateName;
    const scope = exposedPortInfo.nodeInst.data.model;
    const id = buildDocPath({ name, scope });

    closeModal();

    const template = {
      id,
      name,
      scope
    };
    call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, template);
  }, [exposedPortInfo, call, closeModal]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <Tooltip
      title={buildTooltipTitle(
        exposedPortInfo.nodeInst.templateName,
        exposedPortInfo.nodeInst.data.id,
        exposedPortInfo.invalidPorts
      )}
    >
      <div
        data-testid="section_invalid-parameter"
        className={classes.invalidParameterHolder}
      >
        <div>
          <strong>{exposedPortInfo.nodeInst.data.name}</strong>
          <ul>
            {exposedPortInfo.invalidPorts.map(port => (
              <li key={`${exposedPortInfo.nodeInst.data.id}_${port}`}>
                <strong>{port}</strong>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Button
            data-testid="input_open-template"
            className={classes.linkButton}
            onClick={handleOpenDocument}
          >
            <Tooltip
              title={t("CloseModalOpenTemplate", {
                templateName: exposedPortInfo.nodeInst.templateName
              })}
            >
              <strong>{exposedPortInfo.nodeInst.templateName}</strong>
            </Tooltip>
          </Button>
        </div>
      </div>
    </Tooltip>
  );
};

ExposedPortLine.propTypes = {
  exposedPortInfo: PropTypes.object.isRequired,
  call: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired
};

export default ExposedPortLine;
