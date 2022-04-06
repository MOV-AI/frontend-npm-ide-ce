import { Rest } from "@mov-ai/mov-fe-lib-core";

const data = {};
const Helper = {};
const CB_NAME = "backend.CallbackEditor";

/**
 * Call CallbackEditor callback
 * @param {string} functionName : Method name
 * @returns {Promise}
 */
const cloudFunction = async functionName => {
  return Rest.cloudFunction({
    cbName: CB_NAME,
    func: functionName
  })
    .then(response => {
      return response.success ? response.result : null;
    })
    .catch(err => console.warn("debug err", err));
};

/**
 * Get all python libraries
 * @returns {Promise<PyLibs>} Python libraries available
 */
Helper.getAllLibraries = async () => {
  if (data.pyLibs) return Promise.resolve(data.pyLibs);
  return cloudFunction("get_all_libraries").then(libs => {
    data.pyLibs = libs;
    return data.pyLibs;
  });
};

/**
 * Get all callback message types
 * @returns {Promise<Array>} Callback message type available
 */
Helper.getAllMessages = async () => {
  if (data.messages) return Promise.resolve(data.messages);
  return cloudFunction("get_messages").then(messages => {
    data.messages = messages;
    return data.messages;
  });
};

export default Helper;
