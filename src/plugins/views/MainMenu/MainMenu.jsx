import PropTypes from "prop-types";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { VerticalBar, ProfileMenu } from "@mov-ai/mov-fe-lib-react";

const MainMenu = ({ profile, call }) => {
  const { name } = profile;
  return (
    <VerticalBar
      //   backgroundColor={theme.palette.background.primary}
      unsetAccountAreaPadding={true}
      navigationList={["pedro", "rian", "matheus", "filipe"].map((x, i) => {
        return;
      })}
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
