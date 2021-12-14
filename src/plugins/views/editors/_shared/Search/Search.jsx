import React from "react";
import SearchIcon from "@material-ui/icons/Search";
import { TextField, InputAdornment } from "@material-ui/core";

const Search = props => {
  const { onSearch } = props;
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    onSearch(search);
  }, [onSearch, search]);

  return (
    <TextField
      fullWidth
      placeholder="Search"
      value={search}
      onChange={event => {
        const value = event.target.value;
        setSearch(value);
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
