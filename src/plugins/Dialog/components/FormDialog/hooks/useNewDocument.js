import { PLUGINS } from "../../../../../utils/Constants";
import { validateDocumentName } from "../../../../../utils/Utils";

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
      const validation = validateDocumentName(value);
      return { result: validation, error: "" };
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
    return call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.CHECK_DOCUMENT_EXISTS,
      {
        scope: scope,
        name
      }
    ).then(docExists => {
      const message = docExists ? "Document already exists" : "";
      return { error: docExists, message };
    });
  };

  return { onValidation, onPostValidation };
};

export default useNewDocument;
