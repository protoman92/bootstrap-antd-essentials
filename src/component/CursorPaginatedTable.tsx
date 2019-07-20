import { Table } from "antd";
import "antd/dist/antd.min.css";
import { ColumnProps, SortOrder, TypedColumnProps } from "antd/lib/table";
import { lifecycle } from "bootstrap-react-essentials/dist/component/hoc/betterRecompose";
import {
  CursorPaginationInProps,
  urlCursorPaginatedDataSync,
  URLCursorPaginatedDataSyncInProps,
  URLCursorPaginatedDataSyncOutProps
} from "bootstrap-react-essentials/dist/component/hoc/dataHOC";
import { toArray } from "bootstrap-react-essentials/dist/utils";
import React from "react";
import { compose } from "recompose";
import { StrictOmit } from "ts-essentials";
import "./CursorPaginatedTable.css";

declare module "antd/lib/table" {
  interface TypedColumnProps<T>
    extends StrictOmit<
      ColumnProps<T>,
      "dataIndex" | "filteredValue" | "sortOrder" | "sortDirections"
    > {
    readonly dataIndex: Extract<keyof T, string>;
  }
}

export interface CursorPaginatedTableInProps<T>
  extends Pick<CursorPaginationInProps<T>, "hasNext" | "hasPrevious">,
    URLCursorPaginatedDataSyncInProps<T> {}

export interface CursorPaginatedTableOutProps<T>
  extends URLCursorPaginatedDataSyncOutProps<T> {
  readonly columns: readonly TypedColumnProps<T>[];
  readonly rowKey: Extract<keyof T, string>;

  getFilteredValue?(
    props: TypedColumnProps<T>,
    urlQuery: URLQueryMap
  ): readonly string[] | undefined;
}

/**
 * Abstract the work needed to set up a table that displays paginated data
 * from a server source. Cursor-paginated data assumes that user can only go
 * forward/backward, and not jump pages.
 */
function PrivateCursorPaginatedTable<T>({
  columns: baseColumns,
  data,
  hasNext,
  hasPrevious,
  isLoadingData,
  rowKey,
  urlQuery,
  getFilteredValue,
  goToNextPage,
  goToPreviousPage,
  updateURLQuery
}: CursorPaginatedTableInProps<T> &
  StrictOmit<CursorPaginatedTableOutProps<T>, "urlDataSync">) {
  const sortField = toArray(urlQuery["sortField"] || "")[0] || undefined;
  const sortOrder = toArray(urlQuery["order"] || "")[0] as SortOrder;

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

  const limit = parseInt(toArray(urlQuery["limit"] || "")[0], undefined) || 10;

  return (
    <div className="cursor-paginated-table-container">
      <Table
        columns={columns}
        dataSource={[...data]}
        loading={isLoadingData}
        onChange={({ pageSize }, f, { field: sortField, order }) => {
          updateURLQuery({ ...f, limit: `${pageSize}`, order, sortField });
        }}
        pagination={
          !hasPrevious && !hasNext
            ? false
            : {
                // @ts-ignore
                current: 2 - !hasPrevious + !hasNext,
                onChange: page => {
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
