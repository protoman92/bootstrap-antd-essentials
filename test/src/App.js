import { createURLDataSyncRepository } from "bootstrap-react-essentials/dist/repository/dataRepository";
import { toArray } from "bootstrap-react-essentials/dist/utils";
import React from "react";
import CursorPaginatedTable from "../../src/component/CursorPaginatedTable";
import "./App.scss";

/** @type {Repository.URLDataSync} */
const urlDataSync = {
  ...createURLDataSyncRepository(window),
  get: async (...args) => {
    console.log(`Getting`, args);
    return {
      results: [...Array(100).keys()].map(v => ({ name: v, status: v })),
      next: `${Math.random() * 1000}`,
      hasNext: true,
      previous: `${Math.random() * 1000}`,
      hasPrevious: true
    };
  },
  update: async () => ({})
};

function App() {
  return (
    <div className="App">
      <CursorPaginatedTable
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
        urlDataSync={urlDataSync}
        rowKey={"name"}
      />
    </div>
  );
}

export default App;
