/**
 * useNewDocument hook
 * @returns Functions used to create new document
 */
const useNewDocument = ({ call, scope }) => {
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
  const onPostValidation = name => {
    return call("docManager", "checkDocumentExists", {
      scope: scope,
      name
    }).then(docExists => {
      const message = docExists ? "Document already exists" : "";
      return { error: docExists, message };
    });
  };

  return { onValidation, onPostValidation };
};

export default useNewDocument;
