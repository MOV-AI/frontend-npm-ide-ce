//  Input: parameters array.
//    Example: [{name: "footprint_padding", value: 0.05},{name: "global_frame", value: "odom"},{name: "height", value: 6}]
//  Output: parameters object for Redis
//    Example: {footprint_padding: {Value: 0.05}, global_frame: {Value: "odom"}, height: {Value: 6}}
export function convertParamArrayToRedisObj(paramArray) {
  let currentKey = "";
  let currentValue = "";
  const returnObj = {};

  if (paramArray.length <= 0) {
    return false;
  }

  try {
    paramArray.forEach(elem => {
      currentKey = elem.key;
      currentValue = elem.value;
      returnObj[elem.key] = { Value: JSON.parse(elem.value) };
    });
    return { status: true, data: returnObj };
  } catch (error) {
    let errorMessage = 
      "Format Type Error\n" +
        "In Parameter: " +
        currentKey +
        " , got the value: " +
        currentValue +
        " , and expected one of the following formats:\n" +
        "  Number:  23\n" +
        "  Boolean:  true\n" +
        '  String:  "3D"\n' +
        "  Array:  [2,3]\n" +
        '  Object:  {"key1": "value", "key2": 23}\n' +
        "  NoneType: null\n"
    ;
    return { status: false, error: errorMessage };
  }
}

// Input: redis object.
//    Example: {name: "vicente", age: "23"}
// Output: react state
//    Example: [{key: "name", value: "vicente"}, {key: "age", value: "23"}]
export function convertParamsObjToReactArray(data) {
  let paramArray = [];
  if (data === undefined) {
    return paramArray;
  } else {
    paramArray = Object.keys(data).map(key => {
      return {
        key: key,
        value: JSON.stringify(data[key].Value)
      };
    });
  }

  return paramArray;
}
