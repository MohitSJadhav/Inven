import React from "react";
import { TabPane, Tab, Segment } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import "./Exception.css";
import LookupCpu from "./Search/SearchCpu";
import AddCpu from "./Add/AddCpu";
import DeleteCPU from "./Delete/DeleteCpu";
import UpdateCPu from "./Update/UpdateCpu";

export default function Cpu() {
    const isAdmin = sessionStorage.getItem("isAdmin");
    const panes = [
        { menuItem: 'Lookup Resources', render: () => <TabPane attached={false}><LookupCpu /></TabPane> },
        ...(isAdmin ? [
            { menuItem: 'Add Resources', render: () => <TabPane ><AddCpu /></TabPane> },
            { menuItem: 'Update Resources', render: () => <TabPane ><UpdateCPu /></TabPane> },
            { menuItem: 'Delete Resources', render: () => <TabPane ><DeleteCPU /></TabPane> },
        ] : []),
    ]

    return (<Segment>
        <h1 className="vm-heading">CPU, Disk and Memory</h1>
        <div className="vm-tabs">
            <Tab menu={{ pointing: true }} grid={{ paneWidth: 12, tabWidth: 5 }} renderActiveOnly={true} panes={panes} />
        </div>
    </Segment>
    );
}