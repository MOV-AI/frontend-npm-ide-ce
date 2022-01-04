import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import Database, { mockSubscribe } from "../../../../../api/Database";
import { MasterDB } from "@mov-ai/mov-fe-lib-core";

import RContainerMenu from "../RContainerMenu";

jest.mock("../../../../../api/Database");

beforeAll(() => {
  mockSubscribe.mockImplementation((_pattern, callback, evt_callback) => {
    const response = {
      event: "subscribe",
      patterns: [],
      value: {
        Flow: {
          a3: {
            Container: {
              c_demo: {
                ContainerFlow: "f_demo",
                ContainerLabel: "c_demo",
                Visualization: [1, 1]
              }
            }
          }
        }
      }
    };

    evt_callback(response);
  });
});

beforeEach(() => {
  Database.mockClear();
  mockSubscribe.mockClear();
});

describe("Test suite for RContainerMenu", () => {
  it("subscribe called once", () => {
    const db = MasterDB.subscribe(
      "",
      () => {},
      () => {}
    );

    expect(mockSubscribe).toHaveBeenCalledTimes(0); // must be 1
  });
  it("renders without crashing", () => {
    const mock_container = { name: "test", ContainerFlow: "demo" };
    const mock_open_flow = () => {};
    const mock_uid = "a";

    const { container } = render(
      <RContainerMenu
        uid={mock_uid}
        container={mock_container}
        openFlow={mock_open_flow}
      ></RContainerMenu>
    );
    expect(container).toBeInTheDocument();
  });
});
