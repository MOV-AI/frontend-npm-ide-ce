import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Divider, Link, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { portStyles } from "../styles";
import { SCOPES } from "../../../../../../../utils/Constants";

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
          className={`${classes.portCallbackLink} ${classes.disabled}`}
        >
          {callback}
        </Typography>
      ) : (
        <Link
          key={`${callback}_${index}`}
          className={classes.portCallbackLink}
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
      );
    },
    [protectedDocs, classes, openDoc]
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

  React.useEffect(() => {
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
        {t("Ports:")}
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
