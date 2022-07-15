import { useCallback } from "react";

const useSelectOptions = data => {
  const { scopeSystemPortsData, scopePorts } = data;

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Sort array of objects by label
   * @param {object} a : Comparable A
   * @param {object} b : Comparable B
   */
  const sortByLabel = (a, b) => {
    if (a.label > b.label) return 1;
    else return b.label > a.label ? -1 : 0;
  };

  /**
   * Insert element in alphabetical order
   * @param {{options: array}} groupObj : Group with options array to insert item
   * @param {object} item : Item to insert
   * @returns {object} : Object with ordered options array
   */
  const insertInAlphabeticalOrder = (groupObj, item) => {
    for (let i = 0; i < groupObj.options.length; i++) {
      const element = groupObj.options[i].label;
      if (item.label <= element) {
        groupObj.options.splice(i, 0, item);
        break;
      }
      if (i === groupObj.options.length - 1) {
        groupObj.options.push(item);
        break;
      }
    }
    return groupObj;
  };

  //========================================================================================
  /*                                                                                      *
   *                                    Exposed Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Receive an object of Templates/Ports and format to render
   */
  const getGroupOptions = useCallback(() => {
    const groupedObj = [];
    let groupIndex = -1;
    try {
      scopePorts !== undefined &&
        Object.keys(scopePorts).forEach(templateKey => {
          const [transport, protocol] =
            scopePorts[templateKey].Label.split("/");
          // Set options to insert
          const option = { value: templateKey, label: protocol || transport };
          // If not protocol insert transport into groupedObj
          if (!protocol) groupedObj.push(option);
          else {
            // Find if there is a group already with that transport
            groupIndex = groupedObj.findIndex(elem => elem.label === transport);
            // If no group, create one
            if (groupIndex === -1) {
              groupedObj.push({
                label: transport,
                options: [option]
              });
            }
            // Else just append to that group options
            else {
              // Put in alphabetical order
              const existingGroup = { ...groupedObj[groupIndex] };
              groupedObj[groupIndex] = insertInAlphabeticalOrder(
                existingGroup,
                option
              );
            }
          }
        });
    } catch (error) {
      console.warn("debug : Error getting Transport/Protocol Options");
    }
    return groupedObj;
  }, [scopePorts]);

  /**
   * Dependencies object and the selected template.
   * @returns {array} List of Packages
   */
  const getPackageOptions = useCallback(rowData => {
    if (
      rowData === undefined ||
      rowData.template === undefined ||
      rowData.template === ""
    ) {
      return [];
    }
    let packageOptions = [];
    try {
      const dataObj = { ...scopePorts[rowData.template].Data };
      // If there is package and message add package option
      if (Object.keys(dataObj).length > 1) {
        packageOptions = [{ value: dataObj.Package, label: dataObj.Package }];
      }
      // Else go find by type. Example: ROS1_msg, ROS1_action
      else {
        packageOptions = Object.keys(scopeSystemPortsData[dataObj.type]).map(
          element => {
            return { value: element, label: element };
          }
        );
      }
      // Return sorted package options
      return packageOptions.sort(sortByLabel);
    } catch (error) {
      console.warn("debug : Error getting Package Options");
      return [];
    }
  }, [scopePorts, scopeSystemPortsData]);

  /**
   * Get list of messages based in dependencies object and the selected protocol and package.
   * @returns {array} List of Messages
   */
  const getMessageOptions = useCallback(rowData => {
    if (
      rowData === undefined ||
      rowData.template === undefined ||
      rowData.template === "" ||
      rowData.msgPackage === undefined ||
      rowData.msgPackage === ""
    ) {
      return [];
    }
    let messageOptions = [];
    try {
      const dataObj = { ...scopePorts[rowData.template].Data };
      // If there is package and message add package option
      if (Object.keys(dataObj).length > 1) {
        messageOptions = [{ value: dataObj.Message, label: dataObj.Message }];
      }
      // Else go find by type and selected package and return the messages
      else {
        messageOptions = scopeSystemPortsData[dataObj.type][
          rowData.msgPackage
        ].map(element => {
          return { value: element, label: element };
        });
      }
      // Return sorted messages
      return messageOptions.sort(sortByLabel);
    } catch (error) {
      console.warn("debug : Error in getting Message Options");
      return [];
    }
  }, [scopePorts, scopeSystemPortsData]);

  return { getGroupOptions, getPackageOptions, getMessageOptions };
};

export default useSelectOptions;
