import React, { useCallback, useState } from "react";
import SearchIcon from "@material-ui/icons/Search";
import PropTypes from "prop-types";
import {
  TextField,
  InputAdornment,
  IconButton,
  Popper
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { flowTopBarStyles } from "./styles";
import { NodeInstance } from "../../../../../../models/Flow/subModels";
import { useTranslation } from "react-i18next";

const FlowSearch = props => {
  const { searchOptions, onSearchNode } = props;
  const classes = flowTopBarStyles();
  const { t } = useTranslation();
  const [searchVisible, setSearchOpen] = useState(false);

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  const handleSearchNode = useCallback(
    (_e, node) => {
      return onSearchNode(node);
    },
    [onSearchNode]
  );

  const handleSearchToggle = useCallback(() => {
    setSearchOpen(!searchVisible);
  }, [searchVisible]);

  //========================================================================================
  /*                                                                                      *
   *                                       Renderers                                      *
   *                                                                                      */
  //========================================================================================

  const renderSearchPopup = useCallback(
    _popperProps => (
      <Popper
        {..._popperProps}
        className={classes.searchPopup}
        placement="bottom-start"
      />
    ),
    [classes.searchPopup]
  );

  const renderSearchInput = useCallback(
    params => {
      return (
        <TextField
          {...params}
          variant="standard"
          placeholder={t("SearchFlowEntities")}
          className={classes.searchInputText}
          autoFocus
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            )
          }}
        />
      );
    },
    [classes.searchInputText, t]
  );

  if (!searchVisible) {
    return (
      <IconButton
        testId="input_search-icon"
        onClick={handleSearchToggle}
        size="small"
        variant="contained"
      >
        <SearchIcon color="action" />
      </IconButton>
    );
  }

  return (
    <Autocomplete
      data-testid="input_search-flow-text"
      options={searchOptions}
      getOptionLabel={option => option.name}
      onChange={handleSearchNode}
      onBlur={handleSearchToggle}
      groupBy={option =>
        option instanceof NodeInstance ? t("Node") : t("SubFlow")
      }
      PopperComponent={renderSearchPopup}
      renderInput={renderSearchInput}
    />
  );
};

FlowSearch.propTypes = {
  onSearchNode: PropTypes.func,
  searchOptions: PropTypes.arrayOf(PropTypes.string)
};

export default FlowSearch;
