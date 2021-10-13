import "./App.css";
import React from "react";
import PluginManagerIDE from "../PluginManagerIDE/PluginManagerIDE";
import PluginList from "../plugins/views/PluginList/PluginList";
import SidePanel from "../plugins/hosts/SidePanel/SidePanel";
import CentralPanel from "../plugins/hosts/CentralPanel/CentralPanel";

function App() {
  writeMovaiLogo();
  React.useEffect(() => {
    installViewPlugins();
  }, []);
  return <div style={{ display: "flex" }}>{getHostedPlugins()}</div>;
}

function installViewPlugins() {
  const listProfile = {
    name: "list",
    displayName: "plugin list",
    location: "leftPanel"
  };
  const list = new PluginList(listProfile);
  PluginManagerIDE.install(listProfile.name, list);
}

function getHostedPlugins() {
  return (
    <>
      <SidePanel style={{ flexGrow: 1 }} name="leftPanel"></SidePanel>
      <CentralPanel style={{ flexGrow: 1 }} name="mainPanel"></CentralPanel>
      <SidePanel
        style={{ flexGrow: 1 }}
        name="rightPanel"
        anchor="right"
      ></SidePanel>
    </>
  );
}

function writeMovaiLogo() {
  console.log(MOVAI_LOGO);
}

const MOVAI_LOGO = `
███╗   ███╗ ████████╗ ██╗   ██╗         █████╗ ██╗ 
████╗ ████║ ██║   ██║ ██║   ██║        ██╔══██╗██║
██╔████╔██║ ██║   ██║ ██║   ██║ █████╗ ███████║██║
██║╚██╔╝██║ ██║   ██║  █║  ██╔╝ ╚════╝ ██╔══██║██║
██║ ╚═╝ ██║ ╚██████═╝   ╚███═╝         ██║  ██║██║
`;

export default App;
