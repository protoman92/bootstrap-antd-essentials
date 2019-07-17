import { Table } from "antd";
import "antd/dist/antd.min.css";
import { ColumnProps, TypedColumnProps } from "antd/lib/table";
import { lifecycle } from "bootstrap-react-essentials/dist/component/hoc/betterRecompose";
import {
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
    extends StrictOmit<ColumnProps<T>, "filteredValue"> {
    readonly dataIndex?: Extract<keyof T, string>;
  }
}

interface CursorPaginatedTableInProps<T>
  extends URLCursorPaginatedDataSyncInProps<T> {}

interface CursorPaginatedTableOutProps<T>
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
  isLoadingData,
  rowKey,
  urlQuery,
  getFilteredValue,
  goToNextPage,
  goToPreviousPage,
  updateURLQuery
}: CursorPaginatedTableInProps<T> &
  StrictOmit<CursorPaginatedTableOutProps<T>, "urlDataSync">) {
  const columns: ColumnProps<T>[] = baseColumns.map(
    (column): ColumnProps<T> => {
      const filteredValue = [
        ...((!!getFilteredValue && getFilteredValue(column, urlQuery)) || [])
      ];

      return { ...column, filteredValue };
    }
  );

  const limit = parseInt(toArray(urlQuery["limit"] || "")[0], undefined) || 10;

  return (
    <div className="cursor-paginated-table-container">
      <Table
        columns={columns}
        dataSource={[...data]}
        loading={isLoadingData}
        onChange={({ pageSize }, f, o) => {
          updateURLQuery({ ...f, limit: `${pageSize}` });
        }}
        pagination={{
          current: 2,
          defaultCurrent: 2,
          onChange: page => {
            page === 1 ? goToPreviousPage() : goToNextPage();
          },
          pageSize: limit,
          total: limit * 3,
          showSizeChanger: true
        }}
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
