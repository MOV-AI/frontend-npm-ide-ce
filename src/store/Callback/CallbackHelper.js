import { Rest } from "@mov-ai/mov-fe-lib-core";

const data = {};
const Helper = {};
const CB_NAME = "backend.CallbackEditor";

Helper.getAllLibraries = () => {
  if (data.pyLibs) return Promise.resolve(data.pyLibs);
  return Rest.cloudFunction({
    cbName: CB_NAME,
    func: "get_all_libraries",
    args: {}
  })
    .then(response => {
      if (!response.success) return;
      data.pyLibs = response.result;
      return data.pyLibs;
    })
    .catch(err => console.error("debug err", err));
};

Helper.getAllMessages = () => {
  console.log("debug helper getAllMessages", data);
};

export default Helper;
