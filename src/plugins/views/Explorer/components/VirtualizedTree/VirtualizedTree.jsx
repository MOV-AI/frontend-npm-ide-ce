import React from "react";
import PropTypes from "prop-types";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { DEFAULT_EXPLORER_ROW_HEIGHT } from "../../../../../utils/Constants";

import { virtualizedTreeStyles } from "./styles";

const VirtualizedTree = props => {
  const { itemData, rowRender, fixedHeight, fixedWidth } = props;

  // Style hook
  const classes = virtualizedTreeStyles();

  //========================================================================================
  /*                                                                                      *
   *                                        Renders                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Default row render function
   * @param {*} rowProps
   * @returns {JSX} To be rendered
   */
  const defaultRow = rowProps => {
    const { index, style, data } = rowProps;
    return (
      <div className={classes.listItem} style={style}>
        {data[index].label} {index}
      </div>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }) => {
        return (
          <FixedSizeList
            height={fixedHeight ?? height}
            width={fixedWidth ?? width}
            itemCount={itemData.length}
            itemData={itemData}
            itemSize={DEFAULT_EXPLORER_ROW_HEIGHT}
          >
            {rowRender ?? defaultRow}
          </FixedSizeList>
        );
      }}
    </AutoSizer>
  );
};

VirtualizedTree.propTypes = {
  itemData: PropTypes.array.isRequired,
  rowRender: PropTypes.func,
  fixedHeight: PropTypes.number,
  fixedWidth: PropTypes.number
};

export default VirtualizedTree;
