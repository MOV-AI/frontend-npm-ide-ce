/**
 * Hook to return helper methods
 * @returns {{getAllCallbacksWithMessage: function, getEffectiveMessage: function}}
 */
const useHelper = () => {
  /**
   * Get all callback with specific message
   * @param {object} allCallbacks
   * @param {string} message
   * @returns {array} Callbacks with message
   */
  const getAllCallbacksWithMessage = (allCallbacks, message) => {
    const result = [];
    Object.keys(allCallbacks).forEach(cb => {
      if (allCallbacks[cb].Message === message) {
        result.push(allCallbacks[cb].Label);
      }
    });
    return result;
  };

  /**
   * Get effective message from port data
   * @param {object} configRowData : Config row data (table rowData)
   * @param {string} direction : One of options ("portIn" or "portOut")
   * @param {string} portName : Port name
   * @returns {string} Formatted message
   */
  const getEffectiveMessage = (configRowData, direction, portName) => {
    try {
      const generalMsg = configRowData.message;
      const generalPkg = configRowData.msgPackage;
      const [receivedMsg1, receivedMsg2] =
        configRowData[direction][portName].Message.split("&");
      // If there is no "&" in the message
      if (receivedMsg2 === undefined) {
        return receivedMsg1;
      } else {
        return generalPkg + "/" + receivedMsg1 + generalMsg + receivedMsg2;
      }
    } catch (err) {
      console.log(":: ERROR ::\n In replaceAmpersandWithMessage()", err);
      return undefined;
    }
  };

  return { getAllCallbacksWithMessage, getEffectiveMessage };
};

export default useHelper;
