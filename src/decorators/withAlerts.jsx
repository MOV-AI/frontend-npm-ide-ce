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

    return (
      <Component
        {...props}
        ref={ref}
        alert={alert}
        alertSeverities={SEVERITIES}
      />
    );
  };
};

export default withAlerts;
