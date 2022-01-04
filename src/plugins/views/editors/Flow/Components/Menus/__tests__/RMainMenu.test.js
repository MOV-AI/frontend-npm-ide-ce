import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import RMainMenu from "../RMainMenu";

describe("Test suite for RMainMenu", () => {
  it("renders without crashing", () => {
    const mock_uid = "a";

    const { container } = render(<RMainMenu uid={mock_uid}></RMainMenu>);
    expect(container).toBeInTheDocument();
  });
});
