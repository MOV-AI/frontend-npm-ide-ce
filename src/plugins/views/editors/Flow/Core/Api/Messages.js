const messages = function () {
  return Object.freeze({
    flow: {
      onAddSuccess: {
        NodeInst: "Node successfully added.",
        Container: "Sub flow successfully added."
      },
      onDeleteSuccess: {
        NodeInst: "Node successfully deleted.",
        Container: "Sub flow successfully deleted.",
        Global: "Successfully deleted."
      },
      onCopySuccess: {
        NodeInst: " Node successfully copied.",
        Container: " Sub flow successfully copied."
      },
      onExposedPortsSuccess: "Exposed port updated.",
      onSaveSuccess: "Successfully saved."
    },
    sm: {
      onAddSuccess: {
        State: "State successfully added."
      },
      onDeleteSuccess: {
        State: "State successfully deleted."
      },
      onCopySuccess: {
        State: " State successfully copied."
      }
    },
    onDeleteInvLinkSuccess: "All invalid links were deleted",
    onDeleteInvLinkFail: "Invalid links were not deleted"
  });
};

export { messages };
