import { orthoPath } from "./Paths";

export const generatePathPoints = (src, trg, method = orthoPath) => {
  try {
    return method(src, trg);
  } catch (error) {
    console.error(error);
    return [];
  }
};
