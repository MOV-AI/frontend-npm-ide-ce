import React from "react";
import _isEqual from "lodash/isEqual";

const useDataSubscriber = props => {
  const { instance, keysToDisconsider = [], propsData = {} } = props;
  // State hooks
  const [data, setData] = React.useState({});
  const [details, setDetails] = React.useState({});
  //

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    var subscriberId;
    var modelRef = instance.current;
    if (modelRef) {
      setData(modelRef.serialize());
      setDetails(modelRef.getDetails());
      subscriberId = modelRef.subscribe((model, key, value) => {
        if (keysToDisconsider.includes(key)) return;
        // Update doc data to be used locally
        setData(prevState => {
          if (_isEqual(prevState[key], value)) return prevState;
          return { ...prevState, [key]: value };
        });
        // Update details
        if (key === "details") setDetails(value);
      });
    }
    // on component unmount : unsubscribe
    return () => {
      if (subscriberId) modelRef.unsubscribe(subscriberId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, propsData]);

  return { data, details };
};

export default useDataSubscriber;
