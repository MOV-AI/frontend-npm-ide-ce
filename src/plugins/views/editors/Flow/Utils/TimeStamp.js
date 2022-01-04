/**
 * Adds a timestamp
 * @param  {object}  flow   current flow state
 * @param  {string}  label  flow name
 * @param  {array}   nodes  nodes to timestamp
 * @return {object}  flow   timestamped flow
 */
export function addTimestamp(flow, label, nodes = []) {
  const nodeKeys = ["NodeInst", "Container"]; // keys to add timestamps
  const now = Date.now();
  let flowObj = { ...flow[label] };

  Object.keys(flowObj).forEach(key => {
    if (nodeKeys.includes(key)) {
      nodes.forEach(node => {
        if (!!flowObj[key][node]) {
          flowObj[key][node]._timestamp = now;
        }
      });
    }
  });

  return { [label]: flowObj };
}
export function addTimestampAndStatus(flow, label, nodes = []) {
  const now = Date.now();
  Object.values(flow[label].NodeInst).forEach(elem => {
    if (nodes.includes(elem.NodeLabel)) {
      elem._timestamp = now;
      elem.Status = 1;
    } else {
      elem.Status = 0;
    }
  });
  return flow;
}
