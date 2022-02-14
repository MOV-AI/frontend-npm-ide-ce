// ports that accept links with any other message type
const acceptsAny = ["movai_msgs/Any"];

/**
 * Check if any of the messages accepts any type
 * @param {string} msgA message type
 * @param {string} msgB message type
 */
const checkAny = (msgA, msgB) => {
  return [msgA, msgB].some(msg => acceptsAny.includes(msg));
};

/**
 * Validate ports messages
 * Ports must have same message type
 * or at least one of them should accept any
 * @param {string} msgA message type
 * @param {string} msgB message type
 */
const validMessage = (msgA, msgB) => {
  return msgA === msgB || checkAny(msgA, msgB);
};

/**
 * Validate ports types are different (In and Out)
 * @param {string} typeA port type (In or Out)
 * @param {string} typeB port type (In or Out)
 */
const validType = (typeA, typeB) => {
  return typeA !== typeB;
};

/**
 * checks if ports are linkeable
 * @param {object} dataA port A data {message, type}
 * @param {object} dataB port B data {message, type}
 */
const isLinkeable = (dataA, dataB) => {
  const rules = [
    (a, b) => validMessage(a.message, b.message),
    (a, b) => validType(a.type, b.type)
  ];
  return rules.every(fn => fn(dataA, dataB));
};

export { isLinkeable };
