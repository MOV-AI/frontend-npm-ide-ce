import { useEffect, useRef, useState, useCallback } from "react";
import MainInterface from "../../Components/interface/MainInterface";

const useMainInterface = props => {
  const {
    classes,
    name,
    data,
    type,
    width,
    height,
    container,
    model,
    readOnly,
    workspace,
    version,
    handleEvents
  } = props;

  const [loading, setLoading] = useState(true);

  const mainInterface = useRef();

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
   *                                                                                      */
  //========================================================================================

  const handleMainInterfaceEvents = useCallback(
    (_evt, _data, _callback) => {
      console.log("debug handle events", _evt, _data, _callback);
      if (_evt === "loading") {
        setLoading(_data);
        return;
      }

      if (typeof handleEvents === "function") {
        handleEvents(_evt, _data, _callback);
      }
    },
    [handleEvents]
  );

  //========================================================================================
  /*                                                                                      *
   *                                  Component Lifecycle                                 *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    console.log("debug useMainInterface data", data);
    console.log(
      "debug useMainInterface maininterfacae ",
      mainInterface.current
    );
    if (!data || mainInterface.current) return;
    console.log("debug useMainInterface create ", data);

    mainInterface.current = new MainInterface(
      name,
      type,
      width,
      height,
      container,
      model,
      readOnly,
      workspace,
      version,
      classes,
      data
    );

    mainInterface.current.subscribe(handleMainInterfaceEvents);

    return () => mainInterface.current.destroy();
  });

  return { mainInterface, loading };
};

export default useMainInterface;
