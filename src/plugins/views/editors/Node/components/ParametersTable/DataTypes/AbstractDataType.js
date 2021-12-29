import React from "react";
import { TextField, Typography } from "@material-ui/core";
import { MonacoCodeEditor } from "@mov-ai/mov-fe-lib-code-editor";
import _toString from "lodash/toString";

/**
 * Abstract Data Type Class
 */
class AbstractDataType {
  key = "";
  label = "";
  editComponent = this.defaultStringEditor;
  // hooks
  _theme = {};

  constructor({ theme }) {
    // Set hooks to be used in abstract renders
    this._theme = theme;
    this.defaultStringEditor = this.defaultStringEditor.bind(this);
  }

  /**
   * Get Data type key
   * @returns
   */
  getKey() {
    return this.key;
  }

  /**
   * Get data type label
   * @returns
   */
  getLabel() {
    return this.label;
  }

  /**
   * Get data type edit component
   * @returns
   */
  getEditComponent() {
    return this.editComponent;
  }

  /**
   * Abstract validation : Should fail if not implemented in extended class
   * @returns
   */
  validate() {
    // To be implemented in extended class
    console.warn(
      "debug validation method not implemented for data type",
      this.key
    );
    return Promise.resolve({
      success: false,
      error: "Validation method not implemented"
    });
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Expose lodash toString method
   * @param {*} value
   * @returns {string} String value
   */
  toString(value) {
    return _toString(value);
  }

  /**
   * @private Check if value is already parsed, or if it still needs to be parsed to return
   * @param {*} value : Value to be parsed
   * @returns parsed value
   */
  getParsedValue(value) {
    return typeof value === "string" ? JSON.parse(value) : value;
  }

  /**
   *
   * @param {*} props
   * @param {*} mode
   * @returns
   */
  defaultStringEditor(props, mode = "row") {
    const editor = {
      row: _props => this.stringEditComponent(_props, ""),
      dialog: this.codeEditComponent
    };
    return editor[mode](props);
  }

  /**
   * @private Gets common text editor for regular inputs (strings, arrays, objects, any, default)
   * @param {*} props : Material table row props
   * @param {string} placeholder : Placeholder
   * @param {*} parsedValue : Parsed value (can be a string, array, or object)
   * @returns {ReactComponent} Text input for editing common strings
   */
  stringEditComponent(props, placeholder, parsedValue) {
    const value = parsedValue !== undefined ? parsedValue : props.rowData.value;
    return (
      <TextField
        fullWidth
        placeholder={placeholder}
        value={value || ""}
        onChange={evt => props.onChange(evt.target.value)}
      ></TextField>
    );
  }

  /**
   * @private Render code editor
   * @param {{rowData: {value: string}}, onChange: function, isNew: boolean} props : input props
   * @returns {ReactComponent} Code Editor Component
   */
  codeEditComponent = props => {
    return (
      <Typography component="div" style={{ height: "200px", width: "100%" }}>
        <MonacoCodeEditor
          value={_toString(props.rowData.value)}
          onLoad={editor => {
            if (!props.isNew) editor.focus();
          }}
          language="python"
          theme={this._theme.codeEditor.theme}
          options={{ readOnly: props.disabled }}
          onChange={value => props.onChange(value)}
        />
      </Typography>
    );
  };
}

export default AbstractDataType;
