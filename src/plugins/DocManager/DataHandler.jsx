import React from "react";

const DataHandler = props => {
  const { children, call, scope, name, id } = props;
  const [data, setData] = React.useState();

  const save = () => {
    console.log("debug SAVE", data.name, data);
    call("docManager", "save", { scope, name });
  };

  const create = () => {
    console.log("debug CREATE", data.name, data);
    call("docManager", "create", { scope, name });
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
