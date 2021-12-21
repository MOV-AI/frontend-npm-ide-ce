import { Rest } from "@mov-ai/mov-fe-lib-core";

const data = {};
const Helper = {};

/**
 * This will give the options in the first selector "Transport/Protocol"
 * @returns {Promise<ScopePorts>}
 */
Helper.getAllTransportProtocol = async () => {
  if (data.scopePorts) return Promise.resolve(data.scopePorts);
  const path = `v2/db/global/Ports`;
  return Rest.get({ path })
    .then(ports => {
      console.log("debug ports");
      data.scopePorts = ports.data;
      return data.scopePorts;
    })
    .catch(err => {
      console.warn("debug fail to get transport/protocol", err);
    });
};

/**
 * Get all portsData
 * @returns {Promise<PyLibs>} Python libraries available
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

export default Helper;
