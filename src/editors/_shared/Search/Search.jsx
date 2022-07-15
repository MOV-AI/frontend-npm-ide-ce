import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from "@material-ui/icons/Clear";
import { TextField, IconButton, Tooltip } from "@material-ui/core";
import { DATA_TYPES } from "../../../utils/Constants";

import { searchStyles } from "./styles";

/**
 * Normalize string
 * @param {*} str
 * @returns
 */
const normalizeString = str => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

/**
 *
 * @param {*} searchQuery
 * @param {*} subject
 * @returns
 */
function filter(searchQuery, subject) {
  // Normalize search query
  searchQuery = normalizeString(searchQuery);

  /**
   * Search in numbers and booleans
   * @returns {boolean} True if searchQuery is found in stringified subject
   */
  const searchNonStrings = () => {
    subject = normalizeString(subject.toString());
    return subject.includes(searchQuery);
  };

  switch (typeof subject) {
    case DATA_TYPES.STRING:
      subject = normalizeString(subject);
      return subject.includes(searchQuery);

    case DATA_TYPES.OBJECT:
      // Is array
      if (Array.isArray(subject)) {
        subject = subject?.filter(e => {
          const value = filter(searchQuery, e);

          if (typeof value === DATA_TYPES.BOOLEAN) return value;

          return Boolean(value?.length !== 0);
        });
        return subject;
      }

      // Is an object
      const values = Object.values(subject || {});
      const list = filter(searchQuery, values);
      return list.length > 0 ? subject : false;

    case DATA_TYPES.NUMBER:
      return searchNonStrings();
    case DATA_TYPES.BOOLEAN:
      return searchNonStrings();

    default:
      return subject;
  }
}

const Search = props => {
  const { onSearch } = props;

  // State hooks
  const [searchInput, setSearchInput] = useState("");

  // Translation hook
  const { t } = useTranslation();
  // Style hook
  const classes = searchStyles();

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
    onSearch("");
  };

  /**
   * Simple check to see if there's any value on searchInput
   * @returns {Boolean} true if there's any value on the search
   */
  const isEmpty = () => {
    return searchInput === null || searchInput.trim() === "";
  };

  const doSearch = value => {
    setSearchInput(value);
    onSearch(value);
  };

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle on change search input event
   * @param {*} event
   */
  const onChangeSearch = event => {
    const value = event.target.value;
    doSearch(value);
  };

  return (
    <TextField
      fullWidth
      placeholder={t("Search")}
      value={searchInput}
      onChange={onChangeSearch}
      inputProps={{ "data-testid": "input_search" }}
      InputProps={{
        endAdornment: (
          <IconButton
            data-testid="input_reset-search"
            className={classes.iconButton}
            onClick={resetValue}
          >
            {isEmpty() ? (
              <Tooltip title={t("SearchSomething")}>
                <SearchIcon className={classes.icon} />
              </Tooltip>
            ) : (
              <Tooltip title={t("ResetSearch")}>
                <ClearIcon className={classes.icon} />
              </Tooltip>
            )}
          </IconButton>
        )
      }}
    />
  );
};

export default Search;
export { filter };
