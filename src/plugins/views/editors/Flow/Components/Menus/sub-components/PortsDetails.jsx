import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Divider, Link, Tooltip, Typography } from "@material-ui/core";
import { SCOPES } from "../../../../../../../utils/Constants";
import { portStyles } from "../styles";

const PortsDetails = props => {
  // Props
  const { openDoc, templateData, protectedDocs } = props;
  // State Hooks
  const [inputPorts, setInputPorts] = useState([]);
  const [outputPorts, setOutputPorts] = useState([]);
  // Other Hooks
  const classes = portStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Get node input/output ports
   * @param {*} ports
   * @returns {array} Input and Output ports
   */
  const getPorts = useCallback(ports => {
    const _inputPorts = [];
    const _outputPorts = [];
    Object.keys(ports).forEach(portName => {
      const port = ports[portName];
      const inputs = Object.values(port.portIn);
      const outputs = Object.values(port.portOut);
      const callbacks = inputs.map(el => el.callback).filter(cb => cb);
      // Add input ports
      inputs.some(() =>
        _inputPorts.push({
          name: portName,
          value: callbacks
        })
      );
      // Add output ports
      outputs.some(() => _outputPorts.push({ name: portName }));
    });
    // Set input/output ports
    setInputPorts(_inputPorts);
    setOutputPorts(_outputPorts);
  }, []);

  /**
   * Check if callback is protected and return callback link (if possible)
   * @param {string} callback : Callback name
   * @param {number} index : iteration index
   * @returns {Element} Callback element to be rendered
   */
  const getCallbackLink = useCallback(
    (callback, index) => {
      const isProtected = protectedDocs.includes(callback);
      return isProtected ? (
        <Typography
          key={`${callback}_${index}`}
          className={`${classes.portCallbackLink} ${classes.disabled}`}
        >
          {callback}
        </Typography>
      ) : (
        <Tooltip
          key={`${callback}_${index}`}
          placement={"bottom-start"}
          className={classes.portCallbackLink}
          title={t("OpenCallbackName", { callbackName: callback })}
        >
          <span>
            <Link
              data-testid="input_open-callback"
              disabled={true}
              component="button"
              onClick={event => {
                openDoc({
                  scope: SCOPES.CALLBACK,
                  name: callback,
                  ctrlKey: event.ctrlKey
                });
              }}
            >
              {callback}
            </Link>
          </span>
        </Tooltip>
      );
    },
    [protectedDocs, classes, openDoc, t]
  );

  /**
   * @private Render ports data
   * @param {{name: string, value: array}} portsData
   * @returns {ReactElement} Ports data
   */
  const getInternalData = useCallback(
    portsData => {
      return portsData.map((port, portIndex) => {
        return (
          <Typography
            data-testid="section_port"
            key={`${port.name}_${portIndex}`}
            component="div"
            className={classes.portRow}
          >
            <Typography component="div" className={classes.portName}>
              {port.name}
            </Typography>
            {port.value?.map(getCallbackLink)}
            <Divider />
          </Typography>
        );
      });
    },
    [classes, getCallbackLink]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    getPorts(templateData);
  }, [getPorts, templateData]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <>
      <Typography component="div" className={classes.detailsSection}>
        {t("Ports-Colon")}
      </Typography>
      <Typography component="div" className={classes.detailsContent}>
        <Typography component="div">
          {/* ======== Input ports ======== */}
          {inputPorts.length > 0 && (
            <>
              <div className={classes.detailRow}>
                <div className={`icon-in ${classes.portIcon}`}></div>
                <div className="content">{t("Inputs")}</div>
              </div>
              {getInternalData(inputPorts)}
            </>
          )}
          {/* ======== Output ports ======== */}
          {outputPorts.length > 0 && (
            <>
              <div className={classes.detailRow}>
                <div className={`icon-out ${classes.portIcon}`}></div>
                <div className="content">{t("Outputs")}</div>
              </div>
              {getInternalData(outputPorts)}
            </>
          )}
        </Typography>
      </Typography>
    </>
  );
};

PortsDetails.propTypes = {
  openDoc: PropTypes.func.isRequired,
  templateData: PropTypes.object,
  protectedDocs: PropTypes.array
};

PortsDetails.defaultProps = {
  templateData: {},
  protectedDocs: []
};

export default PortsDetails;
