import React from "react";
import { PLUGINS } from "../utils/Constants";

/**
 * Pass snackbar alerts to components
 * @param {*} Component
 * @returns
 */
const withAlerts = Component => {
  return (props, ref) => {
    // Props
    const { call } = props;

    // Consts
    const SEVERITIES = {
      SUCCESS: "success",
      ERROR: "error",
      INFO: "info",
      WARNING: "warning"
    };

    /**
     * Create snackbar alert
     * @param {{title: String, message: String, location: String, severity: String}} alertData
     */
    const alert = options => {
      call(PLUGINS.ALERT.NAME, PLUGINS.ALERT.CALL.SHOW, options);
    };

    /**
     * Show Confirmation before action
     * @param {{title: string, message: string, submitText: string, onSubmit: function}} confirmationData
     */
    const confirmationAlert = ({ title, message, onSubmit, submitText }) => {
      call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.CONFIRMATION, {
        title,
        message,
        onSubmit,
        submitText
      });
    };

    return (
      <Component
        {...props}
        ref={ref}
        alert={alert}
        confirmationAlert={confirmationAlert}
        alertSeverities={SEVERITIES}
      />
    );
  };
};

export default withAlerts;
