import { createURLDataSyncRepository } from "bootstrap-react-essentials/dist/repository/dataRepository";
import { toArray } from "bootstrap-react-essentials/dist/utils";
import React from "react";
import { withRouter } from "react-router";
import CursorPaginatedTable from "../../src/component/CursorPaginatedTable";
import "./App.scss";

const baseURLDataSync = createURLDataSyncRepository(window);

/** @type {Repository.URLDataSync} */
const syncRepository = {
  ...baseURLDataSync,
  get: async (...args) => {
    console.log(`Getting`, args);
    return {
      results: [...Array(100).keys()].map(v => ({ name: v, status: v })),
      order: "ascend",
      sortField: "status",
      next: `${Math.random() * 1000}`,
      hasNext: true,
      previous: `${Math.random() * 1000}`,
      hasPrevious: true
    };
  },
  update: async () => ({})
};

const Table = withRouter(CursorPaginatedTable);

function App() {
  return (
    <div className="App">
      <Table
        columns={[
          { title: "Name", dataIndex: "name", sorter: true },
          {
            title: "Status",
            dataIndex: "status",
            filters: [{ text: "1", value: "1" }, { text: "2", value: "2" }],
            sorter: true
          }
        ]}
        getFilteredValue={({ dataIndex }, urlQuery) => {
          switch (dataIndex) {
            case "status":
              return toArray(urlQuery["status"] || []);

            default:
              return undefined;
          }
        }}
        rowKey={"name"}
        overrideConfiguration={{ baseURL: "test", url: "test" }}
        syncRepository={syncRepository}
      />
    </div>
  );
}

export default App;
