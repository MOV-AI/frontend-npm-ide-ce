import React from "react";

const MockedComponent = props => <div {...props}></div>;
const withMockedDecorator = Component => Component;

// create mock for Lib React
export const VerticalBar = MockedComponent;

export const ProfileMenu = MockedComponent;

export const withAuthentication = withMockedDecorator;

export const Style = MockedComponent;

const mockedTheme = {
  spacing: () => {},
  palette: {
    background: {
      primary: "",
      secondary: ""
    }
  }
};

export const Themes = {
  dark: mockedTheme,
  light: mockedTheme
};
