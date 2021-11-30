import React from "react";

const MESSAGES = {
  saveSucess: "Saved successfully",
  createSuccess: "Saved successfully"
};

const DataHandler = props => {
  const { children, call, scope, name, id, alert } = props;
  const [data, setData] = React.useState();
  const { t } = useTranslation();

  const save = () => {
    call("docManager", "save", { scope, name }).then(res => {
      alert({ message: t(MESSAGES.saveSucess), severity: "success" });
    });
  };

  const create = () => {
    call("docManager", "create", { scope, name }).then(res => {
      alert({ message: t(MESSAGES.createSuccess), severity: "success" });
    });
  };

  React.useEffect(() => {
    if (!id) return;
    call("docManager", "read", { scope, name }).then(model => setData(model));
  }, [call, id, scope, name]);

  return React.Children.map(children, el =>
    React.cloneElement(el, { data, setData, save, create })
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
