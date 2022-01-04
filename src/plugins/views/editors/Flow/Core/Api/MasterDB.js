import { WSSub } from "@mov-ai/mov-fe-lib-core";

// This singleton was created in order to prevent conflicts with other subscribers
// ex.: the main menu is subscribed to the Node Label key and this prevents
// other subscribers using the same key from receiving the notification change of the key Label
const MasterDB = new WSSub();
export default MasterDB;
