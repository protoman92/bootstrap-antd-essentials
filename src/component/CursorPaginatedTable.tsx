import { Icon, Table } from "antd";
import {
  urlCursorPaginatedDataSync,
  URLDataSyncInProps
} from "bootstrap-react-essentials/dist/component/hoc/dataHOC";
import React from "react";
import { compose } from "recompose";

interface CursorPaginatedTableInProps<T>
  extends URLDataSyncInProps<readonly T[]> {}

interface CursorPaginatedTableOutProps<T> {}

function PrivateCursorPaginatedTable<T>({
  data,
  urlQuery,
  updateURLQuery
}: CursorPaginatedTableInProps<T> & CursorPaginatedTableOutProps<T>) {
  return (
    <div
      className="cursor-paginated-table-container"
      style={{ display: "flex" }}
    >
      <Table
        className="book-list"
        columns={[]}
        dataSource={[...data]}
        onChange={(p, f, o) => updateURLQuery(f)}
        pagination={false}
      />

      {!!data.length && (
        <div
          className="icon-container"
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "8px 0"
          }}
        >
          <Icon type="left" />
          <Icon type="right" />
        </div>
      )}
    </div>
  );
}

const Enhanced = compose<
  CursorPaginatedTableInProps<unknown>,
  CursorPaginatedTableOutProps<unknown>
>(urlCursorPaginatedDataSync())(PrivateCursorPaginatedTable);

export default function CursorPaginatedTable<T>(
  props: CursorPaginatedTableOutProps<T>
) {
  return <Enhanced />;
}
