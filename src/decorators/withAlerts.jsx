import React from "react";

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
      call("alert", "show", options);
    };

    /**
     * Show Confirmation before action
     * @param {{title: string, message: string, submitText: string, onSubmit: function}} confirmationData
     */
    const confirmationAlert = ({ title, message, onSubmit, submitText }) => {
      call("dialog", "confirmation", { title, message, onSubmit, submitText });
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
