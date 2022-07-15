import React from "react";
import useDataSubscriber from "../../../plugins/DocManager/useDataSubscriber";
import DetailsMenu from "../../_shared/DetailsMenu/DetailsMenu";

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

  return (
    <div data-testid="section_node-details-menu">
      <DetailsMenu name={name} details={details}></DetailsMenu>
    </div>
  );
};

export default Menu;
