import React from "react";
import { TabPane, Tab, Segment } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import "./Exception.css";
import AddNetworkConfig from "./Add/AddNetworkConfig";
import UpdateNetworkConfig from "./Update/UpdateNetworkConfig";
import DeleteNetworkConfig from "./Delete/DeleteNetworkConfig";

export default function NetworkConfig() {
  const isAdmin = sessionStorage.getItem("isAdmin");
  const panes = [
    { menuItem: 'Add Config', render: () => <TabPane ><AddNetworkConfig /></TabPane> },
    ...(isAdmin ? [
      { menuItem: 'Update Config', render: () => <TabPane ><UpdateNetworkConfig /></TabPane> },
      { menuItem: 'Delete Config', render: () => <TabPane ><DeleteNetworkConfig /></TabPane> },
    ] : []),
  ]

  return (<Segment>
    <h1 className="vm-heading">Network Config</h1>
    <div className="vm-tabs">
      <Tab menu={{ pointing: true }} grid={{ paneWidth: 12, tabWidth: 5 }} renderActiveOnly={true} panes={panes} />
    </div>
  </Segment>
  );
}