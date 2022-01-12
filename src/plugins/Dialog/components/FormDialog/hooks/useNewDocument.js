/**
 * useNewDocument hook
 * @returns Functions used to create new document
 */
const useNewDocument = ({ call, scope }) => {
  /**
   * Triggered before submit
   * @param {String} value : New document modal's value
   * @returns Validation state : Should accept alphanumeric with dash and underscore (doesn't accept double undescore)
   */
  const onValidation = value => {
    try {
      const validation = new RegExp(/^[\w][0-9A-Za-z-]*(_[0-9A-Za-z-]+)*[_]?$/);
      if (!validation.test(value)) {
        throw new Error("Invalid name");
      }
      return { result: true, error: "" };
    } catch (err) {
      return {
        result: false,
        error: err.message
      };
    }
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
