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

    /**
     * Create snackbar alert
     * @param {{message: String, severity: String}} alertData
     */
    const alert = ({ title, message, location, severity = "success" }) => {
      call("alert", "show", { title, message, severity, location });
    };

    return <Component {...props} ref={ref} alert={alert} />;
  };
};

export default withAlerts;
