import React from "react";
import useDataSubscriber from "../../../../../DocManager/useDataSubscriber";
import DetailsMenu from "../../../_shared/DetailsMenu/DetailsMenu";

const Menu = ({ name, model, details: detailsProp }) => {
  // State hook
  const { details } = useDataSubscriber({
    instance: model,
    propsData: detailsProp
  });

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return <DetailsMenu name={name} details={details}></DetailsMenu>;
};

export default Menu;
