import React from "react";
import { TabPane, Tab, Segment } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import "./Exception.css";
import SearchPackage from "./Search/SearchPackage";
import AddPackage from "./Add/AddPackage";
import UpdatePackage from "./Update/UpdatePackage";
import DeletePackage from "./Delete/DeletePackage";

export default function Package() {
  const isAdmin = sessionStorage.getItem("isAdmin");
  const panes = [
    { menuItem: 'Lookup Package', render: () => <TabPane attached={false}><SearchPackage /></TabPane> },
    ...(isAdmin ? [
      { menuItem: 'Add Package', render: () => <TabPane ><AddPackage /></TabPane> },
      { menuItem: 'Update Package', render: () => <TabPane ><UpdatePackage /></TabPane> },
      { menuItem: 'Delete Package', render: () => <TabPane ><DeletePackage /></TabPane> },
    ] : []),
  ]

  return (<Segment>
    <h1 className="vm-heading">Software Packages</h1>
    <div className="vm-tabs">
      <Tab menu={{ pointing: true }} grid={{ paneWidth: 12, tabWidth: 5 }} renderActiveOnly={true} panes={panes} />
    </div>
  </Segment>
  );
}