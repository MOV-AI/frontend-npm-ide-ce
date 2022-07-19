import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { InputBase, IconButton, Typography } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from "@material-ui/icons/Clear";

import { searchStyles } from "./styles";
const Search = props => {
  const [searchInput, setSearchInput] = useState("");

  const classes = searchStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Resets the search value
   */
  const resetValue = () => {
    setSearchInput("");
    handleSearch("");
  };

  /**
   * Calls search from props to do a search on the files
   * @param {String} query : to filter the files
   */
  const handleSearch = query => {
    props.search(query);
  };

  /**
   * Simple check to see if there's any value on searchInput
   * @returns {Boolean} true if there's any value on the search
   */
  const isEmpty = () => {
    return searchInput === null || searchInput.trim() === "";
  };

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Change handler for search input
   * @param {*} evt
   */
  const handleChange = evt => {
    setSearchInput(evt.target.value);
    handleSearch(evt.target.value);
  };

  return (
    <Typography
      data-testid="section_search"
      component="div"
      className={classes.root}
    >
      <InputBase
        value={searchInput}
        className={classes.input}
        placeholder={t("Search")}
        onChange={handleChange}
      />
      <IconButton
        data-testid="input_confirm"
        className={classes.iconButton}
        onClick={resetValue}
      >
        {isEmpty() ? (
          <SearchIcon className={classes.icon} />
        ) : (
          <ClearIcon className={classes.icon} />
        )}
      </IconButton>
    </Typography>
  );
};

export default Search;
