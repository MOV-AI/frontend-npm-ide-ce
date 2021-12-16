import React from "react";
import SearchIcon from "@material-ui/icons/Search";
import { TextField, InputAdornment } from "@material-ui/core";

const Search = props => {
  const { onSearch } = props;

  return (
    <TextField
      fullWidth
      placeholder="Search"
      defaultValue={""}
      onChange={event => {
        const value = event.target.value;
        onSearch(value);
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
        )
      }}
    />
  );
};

export default Search;
