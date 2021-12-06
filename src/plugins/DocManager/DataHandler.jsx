import React from "react";

const MESSAGES = {
  save: {
    success: "Saved successfully",
    error: "Failed to save"
  }
};

const DataHandler = props => {
  const { children, call, scope, name, id, alert } = props;
  const [data, setData] = React.useState();
  const modelRef = React.useRef();

  const { t } = useTranslation();

  /**
   * Save document
   * @param {String} newName : Document name (used to set document name when creating a new document)
   */
  const save = newName => {
    call("docManager", "save", { scope, name }, newName)
      .then(res => {
        if (res.success) {
          alert({ message: t(MESSAGES.save.success), severity: "success" });
          if (newName) {
            const newTabData = {
              id: data.getUrl(),
              name: newName,
              scope: scope
            };
            call("tabs", "updateTabId", id, newTabData);
          }
        } else {
          alert({ message: t(MESSAGES.save.error), severity: "error" });
        }
      })
      .catch(error =>
        alert({ message: t(MESSAGES.save.error), severity: "error" })
      );
  };

  /**
   * On Load : read data and set model in modelRef
   */
  React.useEffect(() => {
    call("docManager", "read", { scope, name }).then(model => {
      setData(model.serialize());
      modelRef.current = model;
      model.subscribe((key, value) => {
        setData(prevState => {
          return { ...prevState, [key]: value };
        });
      });
    });
  }, [call, scope, name]);

  return React.Children.map(children, el =>
    React.cloneElement(el, { data, save, instance: modelRef })
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

function useTranslation() {
  return { t: s => s };
}
