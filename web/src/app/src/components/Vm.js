import React from "react";
import { TabPane, Tab, Segment } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import DeleteVM from "./Delete/DeleteVM";
import SearchVM from "./Search/SearchVM";
import UpdateVM from "./Update/UpdateVM";
import AddVM from "./Add/AddVM";
import "./Vm.css";
import Lookup from "./Search/LookupVM";


export default function VM() {
  const isAdmin = sessionStorage.getItem("isAdmin");
  const panes = [
    { menuItem: 'Lookup VM Details', render: () => <TabPane ><Lookup /></TabPane> },
    { menuItem: 'Search VM', render: () => <TabPane ><SearchVM /></TabPane> },
    ...(isAdmin ? [
      { menuItem: 'Add New VM', render: () => <TabPane ><AddVM /></TabPane> },
      { menuItem: 'Update VM', render: () => <TabPane ><UpdateVM /></TabPane> },
      { menuItem: 'Delete VM', render: () => <TabPane ><DeleteVM /></TabPane> },
    ] : [])
  ]

  return (<Segment>
    <h1 className="vm-heading">VM Catalogue</h1>
    <div className="vm-tabs">
      <Tab menu={{ pointing: true }} grid={{ paneWidth: 12, tabWidth: 5 }} renderActiveOnly={true} panes={panes} />
    </div>
  </Segment>
  );
}