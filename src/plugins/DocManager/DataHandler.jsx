import React, {
  cloneElement,
  Children,
  useEffect,
  useState,
  useRef
} from "react";
import { getRefComponent } from "../../utils/Utils";
import { PLUGINS } from "../../utils/Constants";

const DataHandler = props => {
  const { children, call, scope, name } = props;
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const modelRef = useRef();

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
  useEffect(() => {
    call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.READ, {
      scope,
      name
    }).then(model => {
      setData(model.serialize());
      modelRef.current = model;
      setLoading(false);
    });
  }, [call, scope, name]);

  return Children.map(children, el =>
    cloneElement(el, { data, save, instance: modelRef, loading })
  );
};

const withDataHandler = Component => {
  const RefComponent = getRefComponent(Component);

  return (props, ref) => {
    return (
      <DataHandler {...props}>
        <RefComponent {...props} ref={ref} />
      </DataHandler>
    );
  };
};

export default DataHandler;

export { withDataHandler };
