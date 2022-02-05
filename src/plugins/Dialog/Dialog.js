import IDEPlugin from "../../engine/IDEPlugin/IDEPlugin";
import ReactDOM from "react-dom";
import ConfirmationDialog from "./components/ConfirmationDialog/ConfirmationDialog";
import NewDocumentDialog from "./components/FormDialog/NewDocumentDialog";
import FormDialog from "./components/FormDialog/FormDialog";
import AlertDialog from "./components/AlertDialog/AlertDialog";
import AlertBeforeAction from "./components/AlertDialog/AlertBeforeAction";
import AppDialog from "./components/AppDialog/AppDialog";
import { SelectScopeModal } from "@mov-ai/mov-fe-lib-react";
import { withTheme } from "../../decorators/withTheme";

class Dialog extends IDEPlugin {
  constructor(profile = {}) {
    // Remove duplicated if needed
    const methods = Array.from(
      new Set([
        ...(profile.methods ?? []),
        "alert",
        "custom",
        "customDialog",
        "confirmation",
        "newDocument",
        "formDialog",
        "copyDocument",
        "selectScopeModal",
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
        submitText={data.submitText}
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
   * Open modal with basic input form
   * @param {*} data
   */
  formDialog(data) {
    const targetElement = this._handleDialogOpen();
    const {
      title,
      submitText,
      onSubmit,
      onClose,
      size,
      multiline,
      inputLabel,
      value
    } = data;
    ReactDOM.render(
      <FormDialog
        call={this.call}
        size={size}
        title={title}
        multiline={multiline}
        defaultValue={value}
        inputLabel={inputLabel}
        submitText={submitText}
        onSubmit={onSubmit}
        onClose={() => {
          this._handleDialogClose();
          onClose && onClose();
        }}
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

  /**
   * App dialog with Custom content
   * @param {{title: string, message: string, actions: Array, onSubmit: function}} data : Data to AppDialog props and Component props
   * @param {ReactComponent} Component : Component to render custom content in app dialog
   */
  custom(data, Component) {
    const { title, actions, onSubmit, submitText, ...props } = data;
    const targetElement = this._handleDialogOpen();
    // Show dialog
    ReactDOM.render(
      <AppDialog
        title={title}
        actions={actions}
        submitText={submitText}
        onSubmit={onSubmit}
        onClose={this._handleDialogClose}
      >
        <Component {...props} />
      </AppDialog>,
      targetElement
    );
  }

  /**
   * Show custom dialog component
   * @param {*} props : Props to pass to DialogComponent
   * @param {ReactComponent} DialogComponent : Custom dialog component
   */
  customDialog(props, DialogComponent) {
    const targetElement = this._handleDialogOpen();
    // Show dialog
    ReactDOM.render(
      <DialogComponent {...props} onClose={this._handleDialogClose} />,
      targetElement
    );
  }

  /**
   * Show SelectScopeModal
   * @param {*} data : Modal props
   */
  selectScopeModal(data) {
    const { onSubmit, message, selected, scopeList } = data;
    const targetElement = this._handleDialogOpen();
    const ThemedModal = withTheme(SelectScopeModal);

    // Handle submit
    const handleDialogSubmit = selectedItem => {
      onSubmit(selectedItem);
      this._handleDialogClose();
    };

    // Show dialog
    ReactDOM.render(
      <ThemedModal
        open={true}
        message={message}
        selected={selected}
        allowArchive={false}
        scopeList={scopeList}
        onCancel={this._handleDialogClose}
        onSubmit={handleDialogSubmit}
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
   * @private Handle dialog open : Prepare element where the dialog will be rendered
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
   * @private Handle dialog close : Unmount dialog component and remove target element
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
