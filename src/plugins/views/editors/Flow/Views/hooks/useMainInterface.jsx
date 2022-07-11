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
    if (!props.data || props.containerId === mainInterface.current?.containerId)
      return;

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
      call,
      graphCls
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
      call,
      graphCls
    });
  }, [props]);

  return { mainInterface };
};

export default useMainInterface;
