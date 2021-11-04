import React, { Component } from "react";
import { InputBase, IconButton, Typography } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from "@material-ui/icons/Clear";

const t = s => s;
class Search extends Component {
  searchInput = null;
  timer = null;
  inputRef = React.createRef();

  handleChange = evt => {
    this.searchInput = evt.target.value;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(this.handleSearch, 250);
  };

  handleSearch = () => {
    if (this.searchInput !== null) this.props.search(this.searchInput);
  };

  resetValue() {
    const input = this.inputRef.current.children[0];
    input.value = "";
    input.focus();
    this.searchInput = "";
    this.handleSearch();
    this.forceUpdate();
  }

  isEmpty() {
    return this.searchInput === null || this.searchInput.trim() === "";
  }

  render() {
    return (
      <Typography
        component="div"
        style={{
          padding: "2px 4px",
          display: "flex",
          alignItems: "center",
          width: "100%"
        }}
      >
        <InputBase
          ref={this.inputRef}
          style={{
            marginLeft: 10,
            flex: 1
          }}
          placeholder={t("Search")}
          onChange={this.handleChange}
        />
        <IconButton
          style={{ padding: 10 }}
          onClick={() => {
            if (!this.isEmpty()) {
              this.resetValue();
            }
          }}
        >
          {this.isEmpty() ? <SearchIcon /> : <ClearIcon />}
        </IconButton>
      </Typography>
    );
  }
}

export default Search;
