// ports that accept links with any other message type
const accepts_any = ["movai_msgs/Any"];

/**
 * Check if any of the messages accepts any type
 * @param {string} msg_a message type
 * @param {string} msg_b message type
 */
const checkAny = (msg_a, msg_b) => {
  return [msg_a, msg_b].some(msg => accepts_any.includes(msg));
};

/**
 * Validate ports messages
 * Ports must have same message type
 * or at least one of them should accept any
 * @param {string} msg_a message type
 * @param {string} msg_b message type
 */
const validMessage = (msg_a, msg_b) => {
  return msg_a === msg_b || checkAny(msg_a, msg_b);
};

/**
 * Validate ports types are different (In and Out)
 * @param {string} type_a port type (In or Out)
 * @param {string} type_b port type (In or Out)
 */
const validType = (type_a, type_b) => {
  return type_a !== type_b;
};

/**
 * checks if ports are linkeable
 * @param {object} data_a port A data {message, type}
 * @param {object} data_b port B data {message, type}
 */
const isLinkeable = (data_a, data_b) => {
  const rules = [
    (a, b) => validMessage(a.message, b.message),
    (a, b) => validType(a.type, b.type)
  ];
  return rules.every(fn => fn(data_a, data_b));
};

export { isLinkeable };
