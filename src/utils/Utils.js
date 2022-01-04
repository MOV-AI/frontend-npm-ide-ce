/**
 * Generate random ID
 * @returns {String} Random ID in format : "1c76107c-146e-40bc-93fb-8148750cf50a"
 */
 export const randomId = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  };