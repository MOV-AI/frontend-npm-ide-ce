import _set from "lodash/set";
import _omit from "lodash/omit";

import { flattenObject } from "../../_shared/Utils/Utils";

import { portsSubscriber } from "./PortsSubscriber";
import { exposedPortsSubscriber } from "./ExposedPortsSubscriber";
import { flowSubscriber } from "./FlowSubscriber";

/**
 * Validates a template. Removes keys that are not valid
 * @param  {object}   template   Template to validate
 * @return {object}
 */
const validateNodeTemplate = template => {
  // Check if the template does not have a name or the name is empty
  let result = true;
  const required_keys = ["Label", "Type", "Persistent"];
  required_keys.forEach(key => {
    if (!(key in template) || [null, undefined, ""].includes(template[key]))
      result = false;
  });

  // check PortsInst
  if (template.PortsInst) {
    Object.keys(template.PortsInst).forEach(port => {
      let to_delete = false;
      // check if PortsInst is valid
      if (
        !template.PortsInst[port].Template ||
        !template.PortsInst[port].Message ||
        !template.PortsInst[port].Package
      ) {
        to_delete = true;
      }
      if (to_delete === true) {
        delete template.PortsInst[port];
      }
    });
  }

  return result;
};

const nodeSubscriber = component => {
  //NODE INST
  const scopeNodes = {
    Scope: "Node",
    Name: "*"
  };
  component.subscribersList.push(scopeNodes);

  component.database.subscribe(
    scopeNodes,
    data => {
      // merge created/deleted/updated nodes

      const { nodeList } = component.state; // array of objects
      const node_name = Object.keys(data.key.Node)[0];
      const index = nodeList.findIndex(n => n.name === node_name); // index > 0: node found

      let new_node = index < 0 ? true : false; // node was not found, maybe it is a new node

      // index <  0: new node
      // index >= 0: update node
      let node_to_edit =
        index < 0
          ? { name: node_name, template: {}, id: node_name }
          : Object.assign({}, nodeList[index]);

      //let updated_node = {};
      const path = flattenObject(data.key.Node[node_name]);

      switch (data.event) {
        case "del": {
          // 'del' may remove template key only without meaning the node was deleted
          new_node = false;

          Object.keys(path).forEach(key => {
            node_to_edit.template = _omit(node_to_edit.template, key);
          });

          // validate node template
          const is_valid = validateNodeTemplate(node_to_edit.template);

          // template is not valid or the node in the list anymore
          if (is_valid !== true || index < 0) {
            node_to_edit = null;
          }
          break;
        }
        default: {
          // merge node changes
          Object.keys(path).forEach(key => {
            node_to_edit.template = _set(node_to_edit.template, key, path[key]);
          });
        }
      }

      // recreate nodes list
      const nodes = nodeList
        .map((node, index) => {
          if (node.name === node_name) {
            new_node = false;
            if (node_to_edit) {
              return { ...node_to_edit };
            }
            return null;
          } else {
            return { ...node };
          }
        })
        .filter(node => node !== null);

      // add the new node
      if (new_node) nodes.push(node_to_edit);

      // set state
      component.setState({ nodeList: nodes }, () => {
        component.isReturnValidated(component.state.nodeList);
        component.nodeTemplateUpdated([node_name]);
      });
    },
    data => {
      // nodes initial load
      let menuList = []; // to remove

      const nodes = Object.keys(data.value.Node)
        .map((key, index, all) => {
          if (key.includes("@SM")) {
            return null;
          }
          menuList.push({ name: data.value.Node[key].Label, id: key }); // to remove
          return { name: key, template: data.value.Node[key], id: key };
        })
        .filter(node => node !== null);

      // set state
      component.setState({ nodeList: nodes }, () => {
        component.isReturnValidated(component.state.nodeList);
      });

      // initialize other subscribers
      portsSubscriber(component);
      exposedPortsSubscriber(component);
      flowSubscriber(component);
    }
  );
};

export { nodeSubscriber };
