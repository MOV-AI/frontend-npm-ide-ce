import { Rest, MasterDB } from "@mov-ai/mov-fe-lib-core";

const data = {};
const Helper = {};
const subscribers = {};
const callbackPatterns = {
  label: { Scope: "Callback", Name: "*", Label: "*" },
  message: { Scope: "Callback", Name: "*", Message: "*" }
};
const EMPTY_ARROW_FN = name => console.log(`${name} not implemented`);

//========================================================================================
/*                                                                                      *
 *                                    Private Methods                                   *
 *                                                                                      */
//========================================================================================

/**
 * Form callback object : Set object with all callbacks and its messages
 * @param {object} messageData : All Messages of exising Callbacks
 * @param {object} labelData : All Labels of existing Callbacks
 * @returns
 */
const formCallbackObject = (messageData, labelData) => {
  const scopeCallback = {};
  Object.keys(messageData.value.Callback).forEach(key => {
    scopeCallback[key] = {};
    scopeCallback[key]["Message"] = messageData.value.Callback[key]["Message"];

    if (labelData.value.Callback[key] !== undefined) {
      scopeCallback[key]["Label"] = labelData.value.Callback[key]["Label"];
    }
  });
  return scopeCallback;
};

//========================================================================================
/*                                                                                      *
 *                                    Exposed Methods                                   *
 *                                                                                      */
//========================================================================================

/**
 * This will give the options in the first selector "Transport/Protocol"
 * @returns {Promise<ScopePorts>}
 */
Helper.getAllTransportProtocol = async () => {
  if (data.scopePorts) return Promise.resolve(data.scopePorts);
  return new Promise((resolve, reject) => {
    try {
      const portsPattern = { Scope: "Ports", Name: "*" };
      subscribers["ports"] = portsPattern;
      MasterDB.subscribe(
        portsPattern,
        () => EMPTY_ARROW_FN("updateScopePorts"),
        res => {
          const allPorts = res?.value?.Ports || {};
          // Filter ports without data
          const filteredPorts = Object.values(allPorts).filter(port => port.Data)
          // Set scopePorts and return result
          data.scopePorts = filteredPorts.reduce((a, v) => ({ ...a, [v.Label]: v}), {}) ;
          resolve(data.scopePorts);
        }
      );
    } catch (err) {
      reject(err);
      console.warn("debug fail to get transport/protocol", err);
    }
  });
};

/**
 * Get all portsData
 * @returns {Promise<SystemPortsData>} Python libraries available
 */
Helper.getPortsData = async () => {
  // If scopeSystemPortsData is cached, resolve with cached value
  if (data.scopeSystemPortsData)
    return Promise.resolve(data.scopeSystemPortsData);
  // Call cloud function
  return Rest.cloudFunction({
    cbName: "backend.getPortsData",
    func: ""
  })
    .then(response => {
      if (response) {
        data.scopeSystemPortsData = response;
        return data.scopeSystemPortsData;
      }
    })
    .catch(err => {
      console.warn("debug fail to get ports data", err);
    });
};

/**
 * Get All callbacks with its messages
 * @returns {Promise<ScopeCallbacks>}
 */
Helper.getScopeCallback = async () => {
  if (data.scopeCallback) return Promise.resolve(data.scopeCallback);
  return new Promise((resolve, reject) => {
    try {
      subscribers["callbackMessages"] = callbackPatterns.message;
      MasterDB.subscribe(
        callbackPatterns.message,
        () => EMPTY_ARROW_FN("updateMessage"),
        messageData => {
          subscribers["callbackLabels"] = callbackPatterns.label;
          MasterDB.subscribe(
            callbackPatterns.label,
            () => EMPTY_ARROW_FN("updateLabel"),
            labelData => {
              const scopeCallback = formCallbackObject(messageData, labelData);
              data.scopeCallback = scopeCallback;
              resolve(scopeCallback);
            }
          );
        }
      );
    } catch (err) {
      reject(err);
      console.warn("debug fail to get transport/protocol", err);
    }
  });
};

//========================================================================================
/*                                                                                      *
 *                                       Licecycle                                      *
 *                                                                                      */
//========================================================================================

/**
 * Destroy : unsubscribe to MasterDB patterns
 */
Helper.destroy = () => {
  Object.values(subscribers).forEach(pattern => {
    MasterDB.unsubscribe(pattern);
  });
};

export default Helper;
