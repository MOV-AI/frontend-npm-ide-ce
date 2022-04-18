import React, { useState } from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import Search, { filter } from "../../../../_shared/Search/Search";
import RowKeyValue from "./RowKeyValue";

import { tableKeyValueStyles } from "../styles";

/**
 * List to show key and input with the value
 * @param {array} list { key: "bla", value: "bla", defaultValue: "place" }
 */
const TableKeyValue = props => {
  const { list, allowSearch } = props;
  const [searchValue, setSearchValue] = useState("");
  const classes = tableKeyValueStyles();

  return (
    <Typography component="div" className={classes.root}>
      {allowSearch && (
        <div className={classes.searchHolder}>
          <Search onSearch={value => setSearchValue(value)}></Search>
        </div>
      )}
      {filter(searchValue, list)
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((item, index) => (
          <RowKeyValue
            data-testid="section_key-value-row"
            {...props}
            key={index}
            item={item}
          />
        ))}
    </Typography>
  );
};

TableKeyValue.propTypes = {
  list: PropTypes.array.isRequired, //[{ key: "bla", value: "bla", defaultValue: "place" }]
  allowSearch: PropTypes.bool
};

TableKeyValue.defaultProps = {
  allowSearch: false
};

export default TableKeyValue;
