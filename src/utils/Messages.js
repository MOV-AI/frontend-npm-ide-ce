const MESSAGES = {
  ERROR_MESSAGES: {
    INVALID_NAME: "InvalidName",
    NAME_IS_MANDATORY: "MandatoryName",
    SOMETHING_WENT_WRONG: "SomethingWentWrong",
    DATA_VALIDATION_FAILED: "DataValidationFailed",
    FILE_DOESNT_EXIST: "FileUrlDoesntExist",
    FAILED_TO_SAVE: "FailedToSave",
    ERROR_RUNNING_SPECIFIC_CALLBACK: "ErrorRunningSpecificCallback",
    TYPE_NAME_IS_MANDATORY: "MandatoryTypeName",
    INSTANCE_NAME_IS_MANDATORY: "MandatoryInstanceName",
    INVALID_TYPE_NAME: "InvalidTypeName",
    INVALID_INSTANCE_NAME: "InvalidInstanceName",
    MULTIPLE_ENTRIES_WITH_SAME_NAME: "MultipleInstancesSameName",
    NO_TRANSPORT_PROTOCOL_CHOSEN: "NoTransportProtocolChosen",
    NO_PACKAGE_CHOSEN: "NoPackageChosen",
    NO_MESSAGE_CHOSEN: "NoMessageChosen"
  },
  WARNING_MESSAGES: {},
  SUCCESS_MESSAGES: {
    SAVED_SUCCESSFULLY: "SavedSuccessfully",
    CALLBACK_CREATED: "CallbackCreated"
  }
};

export const ERROR_MESSAGES = MESSAGES.ERROR_MESSAGES;
export const WARNING_MESSAGES = MESSAGES.WARNING_MESSAGES;
export const SUCCESS_MESSAGES = MESSAGES.SUCCESS_MESSAGES;
export default MESSAGES;
