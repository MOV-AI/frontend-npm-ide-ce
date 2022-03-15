import React from "react";
import { useTranslation } from "react-i18next";
import { PLUGINS, ALERT_SEVERITIES } from "../../utils/Constants";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/Messages";

const DataHandler = props => {
  const { children, call, scope, name, id, alert } = props;
  const [data, setData] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const modelRef = React.useRef();

  const { t } = useTranslation();

  /**
   * Save document
   * @param {String} newName : Document name (used to set document name when creating a new document)
   */
  const save = newName => {
    call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.SAVE,
      { scope, name },
      newName
    )
      .then(res => {
        if (res.success) {
          alert({
            message: t(SUCCESS_MESSAGES.SAVED_SUCCESSFULLY),
            severity: ALERT_SEVERITIES.SUCCESS
          });
          if (newName) {
            const newTabData = {
              id: modelRef.current.getUrl(),
              name: newName,
              scope: scope
            };
            call(
              PLUGINS.TABS.NAME,
              PLUGINS.TABS.CALL.UPDATE_TAB_ID,
              id,
              newTabData
            );
          }
        } else {
          alert({
            message: t(ERROR_MESSAGES.FAILED_TO_SAVE),
            severity: ALERT_SEVERITIES.ERROR
          });
        }
      })
      .catch(error => {
        console.log("Failed to save: error", error);
        alert({
          message: t(ERROR_MESSAGES.FAILED_TO_SAVE),
          severity: ALERT_SEVERITIES.ERROR
        });
      });
  };

  /**
   * On Load : read data and set model in modelRef
   */
  React.useEffect(() => {
    call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.READ, {
      scope,
      name
    }).then(model => {
      setData(model.serialize());
      modelRef.current = model;
      setLoading(false);
    });
  }, [call, scope, name]);

  return React.Children.map(children, el =>
    React.cloneElement(el, { data, save, instance: modelRef, loading })
  );
};

const withDataHandler = Component => {
  return (props, ref) => {
    return (
      <DataHandler {...props}>
        <Component {...props} ref={ref} />
      </DataHandler>
    );
  };
};

export default DataHandler;

export { withDataHandler };
