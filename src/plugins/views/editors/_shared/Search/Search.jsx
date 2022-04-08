import React from "react";
import { useTranslation } from "react-i18next";
import SearchIcon from "@material-ui/icons/Search";
import { TextField, InputAdornment } from "@material-ui/core";
import { DATA_TYPES } from "../../../../../utils/Constants";

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
const filter = (searchQuery, subject) => {
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
        subject = subject.filter(e => {
          const value = filter(searchQuery, e);

          if (typeof value === DATA_TYPES.BOOLEAN) return value;

          return Boolean(value.length !== 0);
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
};

const Search = props => {
  const { onSearch } = props;

  const { t } = useTranslation();

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
    onSearch(value);
  };

  return (
    <TextField
      fullWidth
      placeholder={t("Search")}
      defaultValue={""}
      onChange={onChangeSearch}
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
export { filter };
