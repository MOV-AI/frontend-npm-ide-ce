import { useEffect, useRef, useCallback } from "react";
import MainInterface from "../../Components/interface/MainInterface";

const useMainInterface = props => {
  const {
    classes,
    instance,
    name,
    data,
    type,
    width,
    height,
    container,
    model,
    readOnly,
    handleEvents,
    call
  } = props;

  const mainInterface = useRef();

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
   *                                                                                      */
  //========================================================================================

  const handleMainInterfaceEvents = useCallback(
    (evt, value, callback) => {
      handleEvents(evt, value, callback);
    },
    [handleEvents]
  );

  //========================================================================================
  /*                                                                                      *
   *                                  Component Lifecycle                                 *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    if (!data || mainInterface.current) return;

    mainInterface.current = new MainInterface({
      id: name,
      modelView: instance,
      type,
      width,
      height,
      containerId: container.current.id,
      model,
      readOnly,
      data,
      classes,
      call
    });

    mainInterface.current.subscribe(handleMainInterfaceEvents);
  });

  return { mainInterface };
};

export default useMainInterface;
