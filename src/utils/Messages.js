const MESSAGES = {
  ERROR_MESSAGES: {
    FILE_DOESNT_EXIST: "The file '{{FILE_URL}}' doesn't exist.",
    FAILED_TO_SAVE: "Failed to save",
    ERROR_RUNNING_SPECIFIC_CALLBACK: "Error running {{callbackName}} callback",
    TYPE_NAME_IS_MANDATORY: "{{typeName}} name is mandatory",
    INVALID_TYPE_NAME: "Invalid {{typeName}} name",
    MULTIPLE_ENTRIES_WITH_SAME_NAME:
      "Cannot have multiple instances with same name",
    NO_TRANSPORT_PROTOCOL_CHOSEN: "No Transport and Protocol chosen",
    NO_PACKAGE_CHOSEN: "No Package chosen",
    NO_MESSAGE_CHOSEN: "No Message chosen"
  },
  WARNING_MESSAGES: {},
  SUCCESS_MESSAGES: {
    SAVED_SUCCESSFULLY: "Saved successfully",
    CALLBACK_CREATED: "Callback created"
  }
};

export const ERROR_MESSAGES = MESSAGES.ERROR_MESSAGES;
export const WARNING_MESSAGES = MESSAGES.WARNING_MESSAGES;
export const SUCCESS_MESSAGES = MESSAGES.SUCCESS_MESSAGES;
export default MESSAGES;
