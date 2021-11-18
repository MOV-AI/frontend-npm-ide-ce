import React from "react";
import withMenuHandler from "../../decorators/withMenuHandler";

const DataHandler = props => {
  const children = props.children;
  const [data, setData] = React.useState();

  // const save = () => {
  //   console.log("debug saved data", data);
  // };

  const addKeyBind = (key, callback) => {
    console.log("debug addKeyBind", key, callback);
  };

  React.useEffect(() => {
    if (!props.id) return;
    props
      .call("docManager", "read", { scope: props.scope, name: props.name })
      .then(model => {
        setData(model.data);
        // Handle editor menus rendering
        props.initRightMenu();
      });
  }, [props]);

  return React.Children.map(children, el =>
    React.cloneElement(el, { data, setData, addKeyBind })
  );
};

export default withMenuHandler(DataHandler);
