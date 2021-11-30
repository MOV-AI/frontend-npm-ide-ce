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
  const { t } = useTranslation();

  const save = newName => {
    call("docManager", "save", { scope, name }, newName).then(res => {
      if (res.success) {
        alert({ message: t(MESSAGES.save.success), severity: "success" });
      } else {
        alert({ message: t(MESSAGES.save.error), severity: "error" });
      }
    });
  };

  React.useEffect(() => {
    if (!id) return;
    call("docManager", "read", { scope, name }).then(model => setData(model));
  }, [call, id, scope, name]);

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
