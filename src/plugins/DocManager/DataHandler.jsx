import React from "react";
import { PLUGINS } from "../../utils/Constants";

const DataHandler = props => {
  const { children, call, scope, name } = props;
  const [data, setData] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const modelRef = React.useRef();

  /**
   * Save document
   * @param {String} newName : Document name (used to set document name when creating a new document)
   */
  const save = () => {
    call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.SAVE, {
      scope,
      name
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
