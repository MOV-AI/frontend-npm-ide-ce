import React from "react";
import { snackbar } from "@mov-ai/mov-fe-lib-react";

/**
 * Pass snackbar alerts to components
 * @param {*} Component
 * @returns
 */
const withAlerts = Component => {
  return (props, ref) => {
    /**
     * Create snackbar alert
     * @param {{message: String, severity: String}} alertData
     */
    const alert = ({ message, severity = "success" }) => {
      snackbar({ message, severity });
    };

    return <Component {...props} ref={ref} alert={alert} />;
  };
};

export default withAlerts;
