import IDEPlugin from "../../engine/IDEPlugin/IDEPlugin";
import ReactDOM from "react-dom";
import ConfirmationDialog from "./components/ConfirmationDialog/ConfirmationDialog";
import NewDocumentDialog from "./components/FormDialog/NewDocumentDialog";
import AlertDialog from "./components/AlertDialog/AlertDialog";
import AlertBeforeAction from "./components/AlertDialog/AlertBeforeAction";

class Dialog extends IDEPlugin {
  constructor(profile = {}) {
    // Remove duplicated if needed
    const methods = Array.from(
      new Set([
        ...(profile.methods ?? []),
        "alert",
        "confirmation",
        "newDocument",
        "copyDocument",
        "closeDirtyDocument",
        "saveOutdatedDocument"
      ])
    );
    super({ ...profile, methods });
  }

  //========================================================================================
  /*                                                                                      *
   *                                     Public Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   *
   * @param {*} data
   */
  alert(data) {
    const targetElement = this._handleDialogOpen();
    ReactDOM.render(
      <AlertDialog
        title={data.title}
        message={data.message}
        onClose={this._handleDialogClose}
      />,
      targetElement
    );
  }

  /**
   * Show confirmation alert before action
   * @param {{onSubmit: Function, message: String, title: String}} data
   */
  confirmation(data) {
    const targetElement = this._handleDialogOpen();
    ReactDOM.render(
      <ConfirmationDialog
        title={data.title}
        onSubmit={data.onSubmit}
        message={data.message}
        onClose={this._handleDialogClose}
      />,
      targetElement
    );
  }

  /**
   * Open modal to enter new document name
   * @param {*} data
   */
  newDocument(data) {
    const targetElement = this._handleDialogOpen();
    ReactDOM.render(
      <NewDocumentDialog
        call={this.call}
        title={`New ${data.scope}`}
        submitText={"Create"}
        scope={data.scope}
        onSubmit={data.onSubmit}
        onClose={this._handleDialogClose}
      />,
      targetElement
    );
  }

  /**
   * Open modal to enter copy name
   * @param {*} data
   */
  copyDocument(data) {
    const targetElement = this._handleDialogOpen();
    ReactDOM.render(
      <NewDocumentDialog
        call={this.call}
        scope={data.scope}
        title={`Copy "${data.name}" to`}
        loadingMessage={"Copying document"}
        submitText={"Copy"}
        onSubmit={data.onSubmit}
        onClose={this._handleDialogClose}
      />,
      targetElement
    );
  }

  /**
   * Open Modal to confirm desired action : save, dontSave or cancel
   *  save: close and save
   *  dontSave: close and discard changes
   *  cancel: doesn't close tab
   * @param {{name: string, scope: string, onSubmit: function}} data
   */
  closeDirtyDocument(data) {
    const targetElement = this._handleDialogOpen();
    const title = "Do you want to save the changes?";
    const message = `Your changes to the ${data.scope} "${data.name}" will be lost if you don't save them.`;
    const actions = {
      dontSave: { label: "Don't Save" },
      cancel: { label: "Cancel" },
      save: { label: "Save" }
    };
    ReactDOM.render(
      <AlertBeforeAction
        title={title}
        message={message}
        actions={actions}
        onSubmit={data.onSubmit}
        onClose={this._handleDialogClose}
      />,
      targetElement
    );
  }

  saveOutdatedDocument(data) {
    const targetElement = this._handleDialogOpen();
    // Set dialog message
    const title = "The document is outdated";
    const message =
      "This document has recent updates in the Database. The version you are working is outdated.\n\nIf you update document your changes will be lost.";
    // Set dialog actions
    const actions = {
      updateDoc: { label: "Update document" },
      overwriteDoc: { label: "Overwrite document" },
      cancel: { label: "Cancel" }
    };
    // Show dialog
    ReactDOM.render(
      <AlertBeforeAction
        title={title}
        message={message}
        actions={actions}
        onSubmit={data.onSubmit}
        onClose={this._handleDialogClose}
      />,
      targetElement
    );
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle dialog open : Prepare element where the dialog will be rendered
   * @returns {DOMElement} Target element to render dialog
   */
  _handleDialogOpen() {
    document.body.classList.add(Dialog.BODY_CLASS_NAME);
    const containerElement = document.getElementById("alertPanel");
    const targetElement = document.createElement("div");
    targetElement.id = Dialog.TARGET_ELEMENT_ID;
    containerElement.appendChild(targetElement);
    return targetElement;
  }

  /**
   * Handle dialog close : Unmount dialog component and remove target element
   */
  _handleDialogClose() {
    document.body.classList.remove(Dialog.BODY_CLASS_NAME);
    const targetElement = document.getElementById(Dialog.TARGET_ELEMENT_ID);
    ReactDOM.unmountComponentAtNode(targetElement);
    targetElement.parentNode.removeChild(targetElement);
  }

  //========================================================================================
  /*                                                                                      *
   *                                  Static Attributes                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Class added to the body element when there's a dialog rendered in the app
   */
  static BODY_CLASS_NAME = "react-portal-body-dialog";

  /**
   * Target DOM element ID : Element where the dialog will be rendered
   */
  static TARGET_ELEMENT_ID = "dialog-container";
}

export default Dialog;
