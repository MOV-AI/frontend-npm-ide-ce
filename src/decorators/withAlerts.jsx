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
      />
    );
  };
};

export default withAlerts;
