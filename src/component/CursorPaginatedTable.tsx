import { Table } from "antd";
import "antd/dist/antd.min.css";
import { ColumnProps, SortOrder, TypedColumnProps } from "antd/lib/table";
import { lifecycle } from "bootstrap-react-essentials/dist/component/hoc/betterRecompose";
import {
  urlCursorPaginatedDataSync,
  URLCursorPaginatedDataSyncInProps,
  URLCursorPaginatedDataSyncOutProps
} from "bootstrap-react-essentials/dist/component/hoc/dataHOC";
import React, { Component } from "react";
import { compose } from "recompose";
import { StrictOmit } from "ts-essentials";
import "./CursorPaginatedTable.css";

declare module "antd/lib/table" {
  export interface TypedColumnProps<T>
    extends StrictOmit<
      ColumnProps<T>,
      "dataIndex" | "filteredValue" | "sortOrder" | "sortDirections"
    > {
    readonly dataIndex: Extract<keyof T, string>;
  }
}

export interface CursorPaginatedTableInProps<T>
  extends URLCursorPaginatedDataSyncInProps<T> {}

export interface CursorPaginatedTableOutProps<T>
  extends URLCursorPaginatedDataSyncOutProps<T> {
  readonly columns: readonly TypedColumnProps<T>[];
  readonly rowKey: Extract<keyof T, string>;

  getFilteredValue?(
    props: TypedColumnProps<T>,
    urlQuery: URLQueryMap
  ): readonly string[] | undefined;
}

function mapSortOrder(sortOrder?: string): SortOrder {
  return `${sortOrder}`.startsWith("asc") ? "ascend" : "descend";
}

/**
 * Abstract the work needed to set up a table that displays paginated data
 * from a server source. Cursor-paginated data assumes that user can only go
 * forward/backward, and not jump pages.
 */
class PrivateCursorPaginatedTable<T> extends Component<
  CursorPaginatedTableInProps<T> &
    StrictOmit<CursorPaginatedTableOutProps<T>, "urlDataSync">
> {
  didGoToDifferentPage = false;

  render() {
    let {
      columns: baseColumns,
      data,
      hasNext,
      hasPrevious,
      isLoadingData,
      limit,
      order,
      rowKey,
      sortField,
      appendURLQuery,
      getFilteredValue,
      getURLQuery,
      goToNextPage,
      goToPreviousPage
    } = this.props;

    const urlQuery = getURLQuery();
    const sortOrder = mapSortOrder(order);

    const columns: ColumnProps<T>[] = baseColumns.map(
      (column): ColumnProps<T> => {
        const filteredValue = [
          ...((!!getFilteredValue && getFilteredValue(column, urlQuery)) || [])
        ];

        const { dataIndex } = column;

        return {
          ...column,
          filteredValue,
          sortOrder: sortField === dataIndex ? sortOrder : undefined,
          sortDirections: ["ascend", "descend"]
        };
      }
    );

    limit = limit || 10;

    return (
      <div className="cursor-paginated-table-container">
        <Table
          columns={columns}
          dataSource={[...data]}
          loading={isLoadingData}
          onChange={({ pageSize }, f, { field: sortField, order }) => {
            if (!!this.didGoToDifferentPage) {
              this.didGoToDifferentPage = false;
              return;
            }

            appendURLQuery({ ...f, limit: `${pageSize}`, order, sortField });
          }}
          pagination={
            !hasPrevious && !hasNext
              ? false
              : {
                  // @ts-ignore
                  current: 2 - !hasPrevious + !hasNext,
                  onChange: page => {
                    this.didGoToDifferentPage = true;
                    page === 1 ? goToPreviousPage() : goToNextPage();
                  },
                  pageSize: limit,
                  total: limit * 3,
                  showSizeChanger: true
                }
          }
          rowKey={rowKey}
        />
      </div>
    );
  }
}

const Enhanced = compose<any, CursorPaginatedTableOutProps<any>>(
  urlCursorPaginatedDataSync(),
  lifecycle({
    componentDidMount() {
      const { getData } = this.props as any;
      getData();
    }
  })
)(PrivateCursorPaginatedTable);

export default function CursorPaginatedTable<T>({
  columns,
  rowKey,
  urlDataSync,
  getFilteredValue
}: CursorPaginatedTableOutProps<T>) {
  return (
    <Enhanced
      columns={columns}
      getFilteredValue={getFilteredValue}
      urlDataSync={urlDataSync}
      rowKey={rowKey}
    />
  );
}
