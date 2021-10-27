import PropTypes from "prop-types";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { VerticalBar, ProfileMenu } from "@mov-ai/mov-fe-lib-react";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SnippetFolderIcon from "@mui/icons-material/SnippetFolder";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import { Tooltip } from "@material-ui/core";

const MENUS = [
  {
    name: "callbackEditor",
    icon: () => <ModeEditOutlineIcon></ModeEditOutlineIcon>,
    title: "Callbacks"
  },
  {
    name: "flowEditor",
    icon: () => <SportsEsportsIcon></SportsEsportsIcon>,
    title: "Flows"
  },
  {
    name: "nodeEditor",
    icon: () => <SnippetFolderIcon></SnippetFolderIcon>,
    title: "Nodes"
  },
  {
    name: "configEditor",
    icon: () => <TextSnippetIcon></TextSnippetIcon>,
    title: "Configs"
  }
];

const MainMenu = ({ profile, call }) => {
  return (
    <VerticalBar
      unsetAccountAreaPadding={true}
      navigationList={MENUS.map(menu => (
        <div>
          <Tooltip title={menu.title}>{menu.icon()}</Tooltip>
        </div>
      ))}
      lowerElement={
        <ProfileMenu
          version={"1.2.3"}
          userName={"movai"}
          isDarkTheme={true}
          handleLogout={() => {}}
          handleToggleTheme={() => {}}
        />
      }
    ></VerticalBar>
  );
};

export default withViewPlugin(MainMenu);

MainMenu.propTypes = {
  call: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

MainMenu.defaultProps = {
  profile: { name: "mainMenu" }
};
