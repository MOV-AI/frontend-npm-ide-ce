import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { filter } from "rxjs/operators";
import { makeStyles } from "@material-ui/core/styles";
import InfoIcon from "@material-ui/icons/Info";
import Add from "@material-ui/icons/Add";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import { usePluginMethods } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import { FLOW_EXPLORER_PROFILE, PLUGINS } from "../../../../utils/Constants";
import Clipboard, { KEYS } from "./Utils/Clipboard";
import Vec2 from "./Utils/Vec2";
import BaseFlow from "./Views/BaseFlow";
import Menu from "./Components/Menus/Menu";
import NodeMenu from "./Components/Menus/NodeMenu";
import FlowTopBar from "./Components/FlowTopBar/FlowTopBar";
import FlowBottomBar from "./Components/FlowBottomBar/FlowBottomBar";
import FlowContextMenu from "./Components/Menus/ContextMenu/FlowContextMenu";
import { MODE as FLOW_CONTEXT_MODE } from "./Components/Menus/ContextMenu";
import ContainerMenu from "./Components/Menus/ContainerMenu";
import Explorer from "./Components/Explorer/Explorer";
import LinkMenu from "./Components/Menus/LinkMenu";
import PortTooltip from "./Components/Tooltips/PortTooltip";
import { EVT_NAMES, EVT_TYPES } from "./events";
import { FLOW_VIEW_MODE } from "./Constants/constants";

import "./Resources/css/Flow.css";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    height: "100%",
    flexGrow: 1
  }
}));

const Flow = (props, ref) => {
  // Props
  const {
    id,
    call,
    scope,
    name,
    instance,
    data,
    alert,
    addKeyBind,
    removeKeyBind,
    activateKeyBind,
    deactivateKeyBind,
    confirmationAlert,
    saveDocument,
    on
  } = props;
  // State Hooks
  const [dataFromDB, setDataFromDB] = useState();
  const [robotSelected, setRobotSelected] = useState("");
  const [runningFlow, setRunningFlow] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [warningsVisibility, setWarningsVisibility] = useState(true);
  const [viewMode, setViewMode] = useState(FLOW_VIEW_MODE.default);
  const [tooltipConfig, setTooltipConfig] = useState(null);
  const [contextMenuOptions, setContextMenuOptions] = useState({
    open: false,
    position: { x: 0, y: 0 }
  });

  // Other Hooks
  const classes = useStyles();
  const { t } = useTranslation();
  const clipboard = useMemo(() => new Clipboard(), []);
  // Refs
  const baseFlowRef = React.useRef();
  const mainInterfaceRef = React.useRef();
  const debounceSelection = React.useRef();
  const activeBookmark = React.useRef();
  const selectedNodeRef = React.useRef();
  const selectedLinkRef = React.useRef();
  const isEditableComponentRef = React.useRef(true);
  // Global consts
  const NODE_MENU_NAME = `node-menu`;
  const LINK_MENU_NAME = `link-menu`;

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Used to handle group visibility
   */
  const handleGroupVisibility = useCallback((groupId, visibility) => {
    getMainInterface().onGroupChange(groupId, visibility);
  }, []);

  /**
   * Handle group visibilities
   */
  const groupsVisibilities = useCallback(() => {
    if (!instance.current) return;
    getMainInterface().onGroupsChange(instance.current.getGroups()?.data);
  }, [instance]);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Component did mount
   */
  useEffect(() => {
    on(
      PLUGINS.RIGHT_DRAWER.NAME,
      PLUGINS.RIGHT_DRAWER.ON.CHANGE_BOOKMARK,
      bookmark => {
        activeBookmark.current = bookmark.name;
      }
    );

    // Subscribe to docManager broadcast for flowEditor (global events)
    on(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.FLOW_EDITOR, evt => {
      // evt ex.: {action: "setMode", value: "default"}
      const { action, value } = evt;
      getMainInterface()?.[action](value);
    });
  }, [on]);

  /**
   * Initialize data
   */
  useEffect(() => {
    const model = instance.current;

    if (model) {
      setDataFromDB(model.serializeToDB());
    }
  }, [instance, data]);

  /**
   * Initialize main interface
   */
  useEffect(() => {
    mainInterfaceRef.current = baseFlowRef.current?.mainInterface;
  }, [baseFlowRef.current?.mainInterface]);

  //========================================================================================
  /*                                                                                      *
   *                                        Helper                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Get main interface instance
   */
  const getMainInterface = () => {
    return mainInterfaceRef.current?.current;
  };

  /**
   * Set mode
   * @param {string} mode : Interface mode
   */
  const setMode = useCallback(mode => {
    getMainInterface().setMode(mode);
  }, []);

  /**
   * Get the current node (from context menu) and all other selected nodes
   * @returns {array} Selected nodes
   */
  const getSelectedNodes = useCallback(() => {
    const { args: node } = contextMenuOptions || {};
    const selectedNodesSet = new Set(
      [node].concat(getMainInterface().selectedNodes)
    );
    return Array.from(selectedNodesSet).filter(el => el);
  }, [contextMenuOptions]);

  /**
   * Call broadcast method to emit event to all open flows
   */
  const setFlowsToDefault = useCallback(() => {
    call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.BROADCAST,
      PLUGINS.DOC_MANAGER.ON.FLOW_EDITOR,
      { action: "setMode", value: EVT_NAMES.DEFAULT }
    );
  }, [call]);

  /**
   * Open document in new tab
   * @param {*} docData
   */
  const openDoc = useCallback(
    docData => {
      call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.READ, {
        scope: docData.scope,
        name: docData.name
      }).then(doc => {
        call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
          id: doc.getUrl(),
          name: doc.getName(),
          scope: doc.getScope()
        });
      });
    },
    [call]
  );

  /**
   * @private Used to remove invalid links
   * @param {*} callback
   */
  const deleteInvalidLinks = useCallback(
    (links, callback) => {
      links.forEach(link => instance.current.deleteLink(link.id));
      // Save document and call graph callback
      saveDocument();
      callback && callback();
    },
    [instance, saveDocument]
  );

  /**
   * @private Show alert dialog for containers with invalid parameters
   * @param {*} invalidContainersParam
   */
  const invalidContainersParamAlert = useCallback(
    invalidContainerParams => {
      // Don't show dialog if no invalid params found
      if (!invalidContainerParams || !invalidContainerParams.length) return;
      // Set title and message for alert
      const title = t("Sub-flows with invalid parameters");
      let message = `${t(
        "The parameters of the sub-flow should come from the flow template."
      )} ${t(
        "The following sub-flows contains custom parameters that are not present on its template:"
      )}\n`;
      // Add containers name to message
      invalidContainerParams.forEach(containerId => {
        message += `\n ${containerId}`;
      });
      // Add how to fix information
      message += `\n\n${t(
        "To fix it, you can either remove the custom parameter on the sub-flow or add the parameter on the template."
      )}`;

      // Show alert dialog
      alert({ message, title, location: "modal" });
    },
    [t, alert]
  );

  /**
   * Handle dialog opening
   * @param {*} method
   * @param {*} args
   * @param {*} resolve
   */
  const openDialog = useCallback(
    ({ method, args, resolve }, dialogComponent) => {
      // Deactivate key bind before opening dialog
      deactivateKeyBind();
      // On close dialog reactivate keybind and resolve promise
      args.onClose = () => {
        activateKeyBind();
        resolve && resolve();
      };
      // Call dialog plugin with given method and args
      call(PLUGINS.DIALOG.NAME, method, args, dialogComponent);
    },
    [activateKeyBind, call, deactivateKeyBind]
  );

  /**
   * Open Dialog to Enter Paste Node name
   * @param {*} position : x and y position in canvas
   * @param {*} nodeToCopy : Node data
   * @returns {Promise} Resolved only after submit or cancel dialog
   */
  const pasteNodeDialog = useCallback(
    (position, nodeToCopy) => {
      const node = nodeToCopy.node;
      return new Promise(resolve => {
        const method = PLUGINS.DIALOG.CALL.FORM_DIALOG;
        const args = {
          title: `${t("Paste")} ${node.model}`,
          value: `${node.id}_copy`,
          onSubmit: newName =>
            getMainInterface().pasteNode(newName, node, position)
        };
        // Open Dialog
        openDialog({ method, args, resolve });
      });
    },
    [t, openDialog]
  );

  //========================================================================================
  /*                                                                                      *
   *                               Right menu initialization                              *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Get Menu component based on node model (Flow or Node)
   * @param {Stringimport("lodash").NullableChain} model : One of each "Flow" or "Node"
   * @returns {ReactComponent} Reference to menu component
   */
  const getMenuComponent = useCallback((model = "") => {
    const componentByModel = {
      Node: NodeMenu,
      Flow: ContainerMenu
    };
    return model in componentByModel ? componentByModel[model] : null;
  }, []);

  /**
   * Get node menu if any
   */
  const getNodeMenuToAdd = useCallback(
    node => {
      const MenuComponent = getMenuComponent(node?.data?.model);
      if (!node || !MenuComponent) return;
      return {
        icon: <i className="icon-Nodes" />,
        name: NODE_MENU_NAME,
        view: (
          <MenuComponent
            id={id}
            call={call}
            nodeInst={node}
            flowModel={instance}
            openDoc={openDoc}
            editable={isEditableComponentRef.current}
            groupsVisibilities={groupsVisibilities}
            openDialog={openDialog}
          />
        )
      };
    },
    [
      NODE_MENU_NAME,
      call,
      id,
      instance,
      openDoc,
      openDialog,
      getMenuComponent,
      groupsVisibilities
    ]
  );

  /**
   * Add node menu if any
   */
  const addNodeMenu = useCallback(
    (node, nodeSelection) => {
      const MenuComponent = getMenuComponent(node?.data?.model);
      if (!node || !MenuComponent) return;
      call(
        PLUGINS.RIGHT_DRAWER.NAME,
        PLUGINS.RIGHT_DRAWER.CALL.ADD_BOOKMARK,
        getNodeMenuToAdd(node),
        nodeSelection,
        activeBookmark.current
      );
    },
    [call, getMenuComponent, getNodeMenuToAdd]
  );

  /**
   * Get link right menu if any
   * @param {Link} link : Link to be rendered in menu
   */
  const getLinkMenuToAdd = useCallback(
    link => {
      if (!link) return;
      return {
        icon: <CompareArrowsIcon />,
        name: LINK_MENU_NAME,
        view: (
          <LinkMenu
            id={id}
            call={call}
            link={link.data}
            flowModel={instance}
            sourceMessage={link?.src?.data?.message}
          />
        )
      };
    },
    [LINK_MENU_NAME, call, id, instance]
  );

  /**
   * Add link right menu if any
   * @param {Link} link : Link to be rendered in menu
   */
  const addLinkMenu = useCallback(
    (link, linkSelection) => {
      if (!link) return;
      call(
        PLUGINS.RIGHT_DRAWER.NAME,
        PLUGINS.RIGHT_DRAWER.CALL.ADD_BOOKMARK,
        getLinkMenuToAdd(link),
        linkSelection,
        activeBookmark.current
      );
    },
    [call, getLinkMenuToAdd]
  );

  const renderRightMenu = useCallback(() => {
    const explorerView = new Explorer(FLOW_EXPLORER_PROFILE);
    const details = props.data?.details || {};
    const menuName = `detail-menu`;
    const bookmarks = {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: (
          <Menu
            id={id}
            call={call}
            name={name}
            details={details}
            model={instance}
            handleGroupVisibility={handleGroupVisibility}
            editable={isEditableComponentRef.current}
          ></Menu>
        )
      },
      FlowExplorer: {
        icon: <Add />,
        name: FLOW_EXPLORER_PROFILE.name,
        view: explorerView.render({
          flowId: id,
          mainInterface: getMainInterface()
        })
      }
    };

    // Add node menu if any is selected
    if (selectedNodeRef.current) {
      bookmarks[NODE_MENU_NAME] = getNodeMenuToAdd(selectedNodeRef.current);
    }

    // Add link menu if any is selected
    if (selectedLinkRef.current) {
      bookmarks[LINK_MENU_NAME] = getLinkMenuToAdd(selectedLinkRef.current);
    }

    // add bookmark
    call(
      PLUGINS.RIGHT_DRAWER.NAME,
      PLUGINS.RIGHT_DRAWER.CALL.SET_BOOKMARK,
      bookmarks,
      activeBookmark.current
    );
  }, [
    LINK_MENU_NAME,
    NODE_MENU_NAME,
    call,
    id,
    name,
    instance,
    props.data,
    getNodeMenuToAdd,
    getLinkMenuToAdd,
    handleGroupVisibility
  ]);

  usePluginMethods(ref, {
    renderRightMenu
  });

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * On Robot selection change
   * @param {*} robotId
   */
  const onRobotChange = useCallback(robotId => {
    setRobotSelected(robotId);
  }, []);

  /**
   * On change running flow
   * @param {*} flow
   */
  const onStartStopFlow = useCallback(flow => {
    // Update state variable
    setRunningFlow(prevState => {
      if (prevState === flow) return prevState;
      return flow;
    });
  }, []);

  /**
   * On view mode change
   * @param {string} newViewMode : One of the following "default" or "treeView"
   */
  const onViewModeChange = useCallback(
    newViewMode => {
      setViewMode(prevState => {
        if (prevState === newViewMode) return prevState;
        isEditableComponentRef.current = newViewMode === FLOW_VIEW_MODE.default;
        // Set mode loading after changing view mode
        setMode(EVT_NAMES.LOADING);
        return newViewMode;
      });
    },
    [setMode]
  );

  /**
   * Toggle Warnings
   * @param {boolean} isVisible
   */
  const onToggleWarnings = useCallback(isVisible => {
    getMainInterface()?.onToggleWarnings({ data: isVisible });
    setWarningsVisibility(isVisible);
  }, []);

  /**
   * Update node active status
   * @param {object} nodeStatus : Nodes to update status
   * @param {{activeFlow: string, isOnline: boolean}} robotStatus : Robot current status
   */
  const onNodeStatusUpdate = useCallback((nodeStatus, robotStatus) => {
    getMainInterface()?.nodeStatusUpdated(nodeStatus, robotStatus);
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                  Handle Flow Events                                  *
   *                                                                                      */
  //========================================================================================

  /**
   * On flow validation
   * @param {*} validationWarnings
   */
  const onFlowValidated = useCallback(validationWarnings => {
    const persistentWarns = validationWarnings.warnings.filter(
      el => el.isPersistent
    );
    setWarnings(persistentWarns);
  }, []);

  /**
   * On Node Selected
   * @param {*} node
   */
  const onNodeSelected = useCallback(
    node => {
      clearTimeout(debounceSelection.current);
      debounceSelection.current = setTimeout(() => {
        if (!node) {
          call(
            PLUGINS.RIGHT_DRAWER.NAME,
            PLUGINS.RIGHT_DRAWER.CALL.REMOVE_BOOKMARK,
            NODE_MENU_NAME,
            activeBookmark.current
          );
          selectedNodeRef.current = null;
        } else {
          selectedNodeRef.current = node;
          activeBookmark.current = NODE_MENU_NAME;
          addNodeMenu(node, true);
        }
      }, 300);
    },
    [addNodeMenu, call, NODE_MENU_NAME]
  );

  /**
   * On Link selected
   * @param {BaseLink} link : Link instance
   */
  const onLinkSelected = useCallback(
    link => {
      selectedLinkRef.current = link;
      getMainInterface().selectedLink = link;
      if (!link) {
        call(
          PLUGINS.RIGHT_DRAWER.NAME,
          PLUGINS.RIGHT_DRAWER.CALL.REMOVE_BOOKMARK,
          LINK_MENU_NAME,
          activeBookmark.current
        );
      } else {
        activeBookmark.current = LINK_MENU_NAME;
        addLinkMenu(link, true);
      }
    },
    [call, LINK_MENU_NAME, addLinkMenu]
  );

  /**
   * Close context menu
   */
  const handleContextClose = useCallback(() => {
    setContextMenuOptions(null);
    getMainInterface().setMode(EVT_NAMES.DEFAULT);
  }, []);

  /**
   * On Links validation
   * @param {{invalidLinks: Array, callback: Function}} eventData
   */
  const onLinksValidated = useCallback(
    eventData => {
      const { invalidLinks, callback } = eventData;
      if (invalidLinks.length) {
        call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.CONFIRMATION, {
          submitText: t("Fix"),
          title: t("Invalid Links Found"),
          onSubmit: () => deleteInvalidLinks(invalidLinks, callback),
          message: t(
            "Do you want to fix this? This will remove all invalid links and save the flow"
          )
        });
      }
    },
    [call, t, deleteInvalidLinks]
  );

  /**
   * Subscribe to mainInterface and canvas events
   */
  const onReady = useCallback(
    mainInterface => {
      // subscribe to on enter default mode
      // When enter default mode remove other node/sub-flow bookmarks
      mainInterface.mode.default.onEnter.subscribe(() => {
        onNodeSelected(null);
        onLinkSelected(null);
        setFlowsToDefault();
      });

      // Subscribe to on node select event
      mainInterface.mode.selectNode.onEnter.subscribe(() => {
        const selectedNodes = mainInterface.selectedNodes;
        const node = selectedNodes.length !== 1 ? null : selectedNodes[0];
        onNodeSelected(node);
      });

      // Subscribe to flow validations
      mainInterface.graph.onFlowValidated.subscribe(evtData => {
        const persistentWarns = evtData.warnings.filter(el => el.isPersistent);
        groupsVisibilities();
        onFlowValidated({ warnings: persistentWarns });
        invalidContainersParamAlert(evtData.invalidContainersParam);
      });

      // Subscribe to invalid links validation
      mainInterface.graph.onLinksValidated.subscribe(onLinksValidated);

      // Subscribe to double click event in a node
      mainInterface.mode.onDblClick.onEnter.subscribe(evtData => {
        const node = evtData.node;
        openDoc({
          name: node.templateName,
          scope: node.data.model
        });
      });

      // Subscribe to node instance/sub flow context menu events
      mainInterface.mode.nodeCtxMenu.onEnter.subscribe(evtData => {
        const anchorPosition = {
          left: evtData.event.clientX,
          top: evtData.event.clientY
        };
        setContextMenuOptions({
          args: evtData.node,
          mode: evtData.node?.data?.type,
          anchorPosition,
          onClose: handleContextClose
        });
      });

      mainInterface.mode.addNode.onClick.subscribe(() => {
        const nodeName = getMainInterface().mode.current.props.node.data.name;
        const method = PLUGINS.DIALOG.CALL.FORM_DIALOG;
        const args = {
          title: t("Add Node"),
          submitText: t("Add"),
          value: nodeName,
          onValidation: newName =>
            getMainInterface().graph.validator.validateNodeName(
              newName,
              t("Node")
            ),
          onSubmit: newName => getMainInterface().addNode(newName)
        };
        // Open form dialog
        openDialog({ method, args });
      });

      mainInterface.mode.addFlow.onClick.subscribe(() => {
        const flowName = getMainInterface().mode.current.props.node.data.name;
        const method = PLUGINS.DIALOG.CALL.FORM_DIALOG;
        const args = {
          title: t("Add Sub-flow"),
          submitText: t("Add"),
          value: flowName,
          onValidation: newName =>
            getMainInterface().graph.validator.validateNodeName(
              newName,
              t("Sub-flow")
            ),
          onSubmit: newName => getMainInterface().addFlow(newName)
        };
        // Open form dialog
        openDialog({ method, args });
      });

      // Subscribe to link context menu events
      mainInterface.mode.linkCtxMenu.onEnter.subscribe(evtData => {
        const anchorPosition = {
          left: evtData.event.clientX,
          top: evtData.event.clientY
        };
        setContextMenuOptions({
          args: evtData,
          mode: FLOW_CONTEXT_MODE.LINK,
          anchorPosition,
          onClose: handleContextClose
        });
      });

      // Subscribe to add link event
      mainInterface.events.onAddLink.subscribe(evtData =>
        alert({
          location: "snackbar",
          message: "Link created"
        })
      );

      // Subscribe to canvas context menu
      mainInterface.mode.canvasCtxMenu.onEnter.subscribe(evtData => {
        const anchorPosition = {
          left: evtData.event.clientX,
          top: evtData.event.clientY
        };
        setContextMenuOptions({
          args: evtData.position,
          mode: FLOW_CONTEXT_MODE.CANVAS,
          anchorPosition,
          onClose: handleContextClose
        });
      });

      // subscribe to port context menu event
      mainInterface.mode.portCtxMenu.onEnter.subscribe(evtData => {
        const anchorPosition = {
          left: evtData.event.clientX,
          top: evtData.event.clientY
        };
        setContextMenuOptions({
          args: evtData.port,
          mode: FLOW_CONTEXT_MODE.PORT,
          anchorPosition,
          onClose: handleContextClose
        });
      });

      mainInterface.canvas.events
        .pipe(
          filter(
            event =>
              event.name === EVT_NAMES.ON_MOUSE_OVER &&
              event.type === EVT_TYPES.LINK
          )
        )
        .subscribe(evtData => mainInterface.graph.onMouseOverLink(evtData));

      mainInterface.canvas.events
        .pipe(
          filter(
            event =>
              event.name === EVT_NAMES.ON_MOUSE_OUT &&
              event.type === EVT_TYPES.LINK
          )
        )
        .subscribe(evtData => mainInterface.graph.onMouseOutLink(evtData));

      // Select Link event
      mainInterface.canvas.events
        .pipe(
          filter(
            event =>
              event.name === EVT_NAMES.ON_CLICK && event.type === EVT_TYPES.LINK
          )
        )
        .subscribe(event => onLinkSelected(event.data));

      // subscribe to port mouseOver event
      mainInterface.canvas.events
        .pipe(
          filter(
            event =>
              event.name === EVT_NAMES.ON_MOUSE_OVER &&
              event.type === EVT_TYPES.PORT
          )
        )
        .subscribe(evtData => {
          const { port, event } = evtData;
          const anchorPosition = {
            left: event.layerX + 8,
            top: event.layerY
          };
          setTooltipConfig({
            port,
            anchorPosition
          });
        });

      // subscribe to port mouseOut event
      mainInterface.canvas.events
        .pipe(
          filter(
            event =>
              event.name === EVT_NAMES.ON_MOUSE_OUT &&
              event.type === EVT_TYPES.PORT
          )
        )
        .subscribe(() => {
          setTooltipConfig(null);
        });

      mainInterface.canvas.events
        .pipe(
          filter(
            event =>
              event.name === EVT_NAMES.ON_CHG_MOUSE_OVER &&
              event.type === EVT_TYPES.LINK
          )
        )
        .subscribe(evtData => console.log("onLinkErrorMouseOver", evtData));
    },
    [
      onLinksValidated,
      onNodeSelected,
      onLinkSelected,
      setFlowsToDefault,
      groupsVisibilities,
      onFlowValidated,
      invalidContainersParamAlert,
      openDoc,
      handleContextClose,
      t,
      openDialog,
      alert
    ]
  );

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle Delete : Show confirmation dialog before performing delete action
   * @param {{nodeId: string, callback: function}} data
   */
  const handleDelete = useCallback(
    ({ message, callback }) => {
      call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.CONFIRMATION, {
        submitText: t("Delete"),
        title: t("Confirm to delete"),
        onSubmit: callback,
        message
      });
    },
    [t, call]
  );

  /**
   * Handle copy node
   */
  const handleCopyNode = useCallback(() => {
    const selectedNodes = getSelectedNodes();
    const nodesPos = selectedNodes.map(n =>
      Vec2.of(n.center.xCenter, n.center.yCenter)
    );
    let center = nodesPos.reduce((e, x) => e.add(x), Vec2.ZERO);
    center = center.scale(1 / selectedNodes.length);
    // Nodes to copy
    const nodesToCopy = {
      nodes: selectedNodes.map(n => n.data),
      flow: data.id,
      nodesPosFromCenter: nodesPos.map(pos => pos.sub(center))
    };
    // Write nodes to copy to clipboard
    clipboard.write(KEYS.NODES_TO_COPY, nodesToCopy);
  }, [clipboard, getSelectedNodes, data.id]);

  /**
   * Handle paste nodes in canvas
   */
  const handlePasteNodes = useCallback(
    async evt => {
      if (evt) evt.preventDefault();
      const { args: position = getMainInterface().canvas.mousePosition } =
        contextMenuOptions || {};
      const nodesToCopy = clipboard.read(KEYS.NODES_TO_COPY);
      if (!nodesToCopy) return;

      for (const [i, node] of nodesToCopy.nodes.entries()) {
        const nodesPosFromCenter = nodesToCopy.nodesPosFromCenter || [
          Vec2.ZERO
        ];
        const newPos = Vec2.of(position.x, position.y).add(
          nodesPosFromCenter[i]
        );
        // Open dialog for each node to copy
        await pasteNodeDialog(newPos.toObject(), {
          node: node,
          flow: nodesToCopy.flow
        });
      }
    },
    [clipboard, contextMenuOptions, pasteNodeDialog]
  );

  /**
   * Handle delete node
   */
  const handleDeleteNode = useCallback(() => {
    const selectedNodes = getSelectedNodes();
    if (!selectedNodes.length) return;
    // Callback to delete all nodes
    const callback = () =>
      selectedNodes.forEach(node => {
        getMainInterface().deleteNode(node.data);
      });
    // Compose confirmation message
    let message = t("Are you sure you want to delete");
    message +=
      selectedNodes.length === 1
        ? ` "${selectedNodes[0].data.id}"?`
        : ` ${t("the selected nodes")}?`;
    // Show confirmation before delete
    handleDelete({ message, callback });

    setContextMenuOptions(prevValue => ({ ...prevValue, anchorEl: null }));
  }, [handleDelete, getSelectedNodes, t]);

  /**
   * Handle delete link
   */
  const handleDeleteLink = useCallback(() => {
    const { args: link } = contextMenuOptions;
    getMainInterface().deleteLink(link.id);
  }, [contextMenuOptions]);

  /**
   * Toggle exposed port
   */
  const handleToggleExposedPort = useCallback(() => {
    const { args: port } = contextMenuOptions;
    getMainInterface().toggleExposedPort(port);
  }, [contextMenuOptions]);

  //========================================================================================
  /*                                                                                      *
   *                                       Shortcuts                                      *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    addKeyBind("ctrl+c", handleCopyNode);
    addKeyBind("ctrl+v", handlePasteNodes);
    addKeyBind("esc", setFlowsToDefault);
    addKeyBind(["del", "backspace"], handleDeleteNode);
    // remove keyBind on unmount
    return () => {
      removeKeyBind("ctrl+c");
      removeKeyBind("ctrl+v");
      removeKeyBind("esc");
      removeKeyBind(["del", "backspace"]);
    };
  }, [
    addKeyBind,
    removeKeyBind,
    setFlowsToDefault,
    handleCopyNode,
    handlePasteNodes,
    handleDeleteNode
  ]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div className={classes.root}>
      <div id="flow-top-bar">
        <FlowTopBar
          id={id}
          call={call}
          alert={alert}
          confirmationAlert={confirmationAlert}
          scope={scope}
          warnings={warnings}
          defaultViewMode={viewMode}
          version={instance.current?.version}
          mainInterface={mainInterfaceRef}
          onRobotChange={onRobotChange}
          onStartStopFlow={onStartStopFlow}
          nodeStatusUpdated={onNodeStatusUpdate}
          onViewModeChange={onViewModeChange}
          onReady={onReady}
          // nodeCompleteStatusUpdated={this.onMonitoringNodeStatusUpdate}
        ></FlowTopBar>
      </div>
      <BaseFlow
        {...props}
        ref={baseFlowRef}
        dataFromDB={dataFromDB}
        warnings={warnings}
        warningsVisibility={warningsVisibility}
        onReady={onReady}
      />
      <FlowBottomBar
        openFlow={openDoc}
        onToggleWarnings={onToggleWarnings}
        robotSelected={robotSelected}
        runningFlow={runningFlow}
        warnings={warnings}
      />
      {contextMenuOptions && (
        <FlowContextMenu
          {...contextMenuOptions}
          onNodeCopy={handleCopyNode}
          onCanvasPaste={handlePasteNodes}
          onLinkDelete={handleDeleteLink}
          onNodeDelete={handleDeleteNode}
          onSubFlowDelete={handleDeleteNode}
          onPortToggle={handleToggleExposedPort}
        />
      )}
      {tooltipConfig && <PortTooltip {...tooltipConfig} />}
    </div>
  );
};

Flow.defaultProps = {
  name: ""
};

export default withEditorPlugin(Flow);
