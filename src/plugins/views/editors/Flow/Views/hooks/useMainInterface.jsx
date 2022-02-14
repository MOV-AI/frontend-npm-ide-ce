import { useEffect, useRef } from "react";
import MainInterface from "../../Components/interface/MainInterface";

const useMainInterface = props => {
  //========================================================================================
  /*                                                                                      *
   *                                         Hooks                                        *
   *                                                                                      */
  //========================================================================================

  const mainInterface = useRef();

  //========================================================================================
  /*                                                                                      *
   *                                  Component Lifecycle                                 *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    if (!props.data || mainInterface.current) return;

    const {
      classes,
      instance,
      name,
      data,
      type,
      width,
      height,
      containerId,
      model,
      readOnly,
      call
    } = props;

    mainInterface.current = new MainInterface({
      id: name,
      modelView: instance,
      type,
      width,
      height,
      containerId,
      model,
      readOnly,
      data,
      classes,
      call
    });
  }, [props]);

  return { mainInterface };
};

export default useMainInterface;
