import { Table } from "antd";
import { ComponentType, shallow } from "enzyme";
import React, { createElement } from "react";
import CursorPaginatedTable, {
  PrivateCursorPaginatedTable
} from "./CursorPaginatedTable";

function pickProps<P, K extends keyof P>(
  c: ComponentType<P>,
  ..._keys: readonly K[]
): ComponentType<Pick<P, K>> {
  return c as any;
}

describe("Cursor paginated table", () => {
  it("Should not go to next if hasNext is false", async () => {
    // Setup
    const goToNextPage = jest.fn();
    const goToPreviousPage = jest.fn();

    const Element = createElement(
      pickProps(
        PrivateCursorPaginatedTable,
        "columns",
        "data",
        "getURLQuery",
        "goToNextPage",
        "goToPreviousPage",
        "hasNext",
        "hasPrevious"
      ),
      {
        columns: [],
        data: [],
        getURLQuery: () => ({}),
        goToNextPage,
        goToPreviousPage,
        hasPrevious: true
      }
    );

    const wrapper = shallow(Element);

    // When
    const { pagination } = wrapper.find(Table).props();
    if (!pagination) throw new Error("Something went wrong");
    const { itemRender } = pagination;
    const nextElement = itemRender!(0, "next", <div />);
    const prevElement = itemRender!(0, "prev", <div />);
    shallow(nextElement as any).simulate("click");
    shallow(prevElement as any).simulate("click");

    // Then
    expect(goToNextPage).not.toHaveBeenCalled();
    expect(goToPreviousPage).toHaveBeenCalled();
  });

  it("Should not go to previous if hasPrevious is false", async () => {
    // Setup
    const goToNextPage = jest.fn();
    const goToPreviousPage = jest.fn();

    const Element = createElement(
      pickProps(
        PrivateCursorPaginatedTable,
        "columns",
        "data",
        "getURLQuery",
        "goToNextPage",
        "goToPreviousPage",
        "hasNext",
        "hasPrevious"
      ),
      {
        columns: [],
        data: [],
        getURLQuery: () => ({}),
        goToNextPage,
        goToPreviousPage,
        hasNext: true
      }
    );

    const wrapper = shallow(Element);

    // When
    const { pagination } = wrapper.find(Table).props();
    if (!pagination) throw new Error("Something went wrong");
    const { itemRender } = pagination;
    const nextElement = itemRender!(0, "next", <div />);
    const prevElement = itemRender!(0, "prev", <div />);
    shallow(nextElement as any).simulate("click");
    shallow(prevElement as any).simulate("click");

    // Then
    expect(goToNextPage).toHaveBeenCalled();
    expect(goToPreviousPage).not.toHaveBeenCalled();
  });

  it("Should not show pagination if hasNext/hasPrevious are falsy", async () => {
    // Setup
    const Element = createElement(
      pickProps(
        PrivateCursorPaginatedTable,
        "columns",
        "data",
        "getURLQuery",
        "hasNext",
        "hasPrevious"
      ),
      {
        columns: [],
        data: [],
        getURLQuery: () => ({}),
        hasNext: false,
        hasPrevious: false
      }
    );

    const wrapper = shallow(Element);

    // When
    const { pagination } = wrapper.find(Table).props();

    // Then
    expect(pagination).toEqual(false);
  });

  it("Should not update URL query if going to next page", async () => {
    // Setup
    const replaceURLQuery = jest.fn();

    const Element = createElement(
      pickProps(
        PrivateCursorPaginatedTable,
        "columns",
        "data",
        "getURLQuery",
        "goToNextPage",
        "hasNext",
        "replaceURLQuery"
      ),
      {
        columns: [],
        data: [],
        getURLQuery: () => ({}),
        goToNextPage: () => {},
        hasNext: true,
        replaceURLQuery
      }
    );

    const wrapper = shallow(Element);

    // When
    const { onChange, pagination } = wrapper.find(Table).props();
    if (!pagination) throw new Error("Something went wrong");
    const { itemRender } = pagination;
    const nextElement = itemRender!(0, "next", <div />);
    shallow(nextElement as any).simulate("click");

    onChange!(
      {},
      {},
      { column: {}, columnKey: "", field: "", order: "ascend" },
      { currentDataSource: [] }
    );

    onChange!(
      {},
      {},
      { column: {}, columnKey: "", field: "", order: "ascend" },
      { currentDataSource: [] }
    );

    // Then
    expect(replaceURLQuery).toHaveBeenCalled();
  });

  it("Should not update URL query if going to previous page", async () => {
    // Setup
    const replaceURLQuery = jest.fn();

    const Element = createElement(
      pickProps(
        PrivateCursorPaginatedTable,
        "columns",
        "data",
        "getURLQuery",
        "goToPreviousPage",
        "hasPrevious",
        "replaceURLQuery"
      ),
      {
        columns: [],
        data: [],
        getURLQuery: () => ({}),
        goToPreviousPage: () => {},
        hasPrevious: true,
        replaceURLQuery
      }
    );

    const wrapper = shallow(Element);

    // When
    const { onChange, pagination } = wrapper.find(Table).props();
    if (!pagination) throw new Error("Something went wrong");
    const { itemRender } = pagination;
    const prevElement = itemRender!(0, "prev", <div />);
    shallow(prevElement as any).simulate("click");

    onChange!(
      {},
      {},
      { column: {}, columnKey: "", field: "", order: "ascend" },
      { currentDataSource: [] }
    );

    onChange!(
      {},
      {},
      { column: {}, columnKey: "", field: "", order: "ascend" },
      { currentDataSource: [] }
    );

    // Then
    expect(replaceURLQuery).toHaveBeenCalled();
  });

  it("Should add default override config", async () => {
    try {
      // Setup
      const Element = createElement(
        pickProps(CursorPaginatedTable, "overrideConfiguration"),
        {
          overrideConfiguration: {
            baseURL: "base-url-1"
          }
        }
      );

      CursorPaginatedTable.defaultOverrideConfiguration = { url: "url-1" };
      const wrapper = shallow(Element);

      // When
      const { overrideConfiguration } = wrapper.at(0).props();

      // Then
      expect(overrideConfiguration).toEqual({
        baseURL: "base-url-1",
        url: "url-1"
      });
    } finally {
      CursorPaginatedTable.defaultOverrideConfiguration = undefined;
    }
  });
});
