import React from "react";
import PropTypes from "prop-types";
import _isEqual from "lodash/isEqual";

const useDataSubscriber = props => {
  const { instance, keysToDisconsider, propsData = {} } = props;
  // State hooks
  const [data, setData] = React.useState(propsData);
  const [details, setDetails] = React.useState({});

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    let subscriberId;
    const modelRef = instance.current;
    if (!modelRef) return;

    setData(modelRef.serialize());
    setDetails(modelRef.getDetails());
    subscriberId = modelRef.subscribe((model, key, value) => {
      if (!keysToDisconsider) return;
      if (keysToDisconsider.includes(key)) return;
      // Update doc data to be used locally
      setData(prevState => {
        if (_isEqual(prevState[key], value)) return prevState;
        return { ...prevState, [key]: value };
      });
      // Update details if necessary
      setDetails(prevState => {
        const newDetails = modelRef.getDetails();
        if (prevState === newDetails) return prevState;
        else return newDetails;
      });
    });

    // on component unmount : unsubscribe
    return () => {
      if (subscriberId) modelRef.unsubscribe(subscriberId);
    };
  }, [instance, propsData, keysToDisconsider]);

  return { data, details };
};

useDataSubscriber.propTypes = {
  instance: PropTypes.object.isRequired,
  keysToDisconsider: PropTypes.array.isRequired,
  propsData: PropTypes.object.isRequired
};

export default useDataSubscriber;
