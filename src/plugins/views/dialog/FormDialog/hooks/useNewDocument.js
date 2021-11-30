import _debounce from "lodash/debounce";

/**
 * useNewDocument hook
 * @returns Functions used to create new document
 */
const useNewDocument = ({ call, setState }) => {
  /**
   * Triggered before submit
   * @param {String} value : New document modal's value
   * @returns Validation state
   */
  const onValidation = value => {
    const isEmpty = !value;
    return {
      result: !isEmpty,
      error: isEmpty ? "Document name is required" : ""
    };
  };

  /**
   * Async validation to check if document already exists
   */
  const postValidation = _debounce(name => {
    setState(prevState => {
      call("docManager", "checkDocumentExists", {
        scope: prevState.scope,
        name
      }).then(res => {
        if (!res.result) {
          setState(prevState => {
            return { ...prevState, error: !res.result, helperText: res.error };
          });
        }
      });
      return prevState;
    });
  }, 100);

  /**
   * On change TextField value
   * @param {String} _value : New value
   * @returns {ValidationResult}
   */
  const onChange = _value => {
    const res = onValidation(_value);
    // Set state
    setState(prevState => {
      return {
        ...prevState,
        inputValue: _value,
        error: !res.result,
        helperText: res.error
      };
    });
    // Run post-validation - if any applicable
    if (res.result) {
      postValidation(_value);
    }
    // Return validation result
    return res;
  };

  return { onValidation, onChange };
};

export default useNewDocument;
