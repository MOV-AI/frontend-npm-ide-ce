import IDEPlugin from "../../engine/IDEPlugin/IDEPlugin";
import { snackbar } from "@mov-ai/mov-fe-lib-react";

class Alerts extends IDEPlugin {
  constructor(profile = {}) {
    // Remove duplicated if needed
    const methods = Array.from(new Set([...(profile.methods || []), "show"]));
    super({ ...profile, methods });
  }

  //========================================================================================
  /*                                                                                      *
   *                                     Public Methods                                   *
   *                                                                                      */
  //========================================================================================

  show({ title, message, severity, location = "snackbar" }) {
    const alertByLocation = {
      snackbar: () => snackbar({ message, severity }),
      modal: () => this.call("dialog", "alert", { title, message })
    };
    // Show Alert
    alertByLocation[location]();
  }
}

export default Alerts;
