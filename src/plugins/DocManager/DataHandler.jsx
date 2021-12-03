import React from "react";
import { usePrevious } from "../../engine/ReactPlugin/ViewReactPlugin";

const MESSAGES = {
  save: {
    success: "Saved successfully",
    error: "Failed to save"
  }
};

const DataHandler = props => {
  const { children, call, scope, name, id, alert } = props;
  const [data, setData] = React.useState();
  const previousData = usePrevious(data);
  const modelRef = React.useRef();

  const { t } = useTranslation();

  /**
   * Save document
   * @param {String} newName : Document name (used to set document name when creating a new document)
   */
  const save = newName => {
    call("docManager", "save", { scope, name }, newName).then(res => {
      if (res.success) {
        alert({ message: t(MESSAGES.save.success), severity: "success" });
        if (newName) {
          const newTabData = {
            id: data.getUrl(),
            title: newName + data?.getFileExtension(),
            name: newName,
            scope: scope
          };
          call("tabs", "updateTabId", id, newTabData);
        }
      } else {
        alert({ message: t(MESSAGES.save.error), severity: "error" });
      }
    });
  };

  /**
   * On Load : read data and set model in modelRef
   */
  React.useEffect(() => {
    call("docManager", "read", { scope, name }).then(model => {
      setData(model.serialize());
      modelRef.current = model;
    });
  }, [call, scope, name]);

  /**
   * On change of data (from editor)
   */
  React.useEffect(() => {
    if (!modelRef.current || !previousData) return;
    modelRef.current.setData(data);
  }, [data, previousData]);

  return React.Children.map(children, el =>
    React.cloneElement(el, { data, setData, save })
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
