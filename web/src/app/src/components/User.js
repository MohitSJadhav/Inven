import React from "react";
import { TabPane, Tab, Segment } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import "./Exception.css";
import SearchUser from "./Search/SearchUser";
import DeleteUser from "./Delete/DeleteUser";
import AddUser from "./Add/AddUser";
import UpdateUser from "./Update/UpdateUser";

export default function User() {
    const isAdmin = sessionStorage.getItem("isAdmin");
    const panes = [
        { menuItem: 'Lookup User', render: () => <TabPane attached={false}><SearchUser /></TabPane> },
        ...(isAdmin ? [
            { menuItem: 'Add User', render: () => <TabPane ><AddUser /></TabPane> },
            { menuItem: 'Update User', render: () => <TabPane ><UpdateUser /></TabPane> },
            { menuItem: 'Delete User', render: () => <TabPane ><DeleteUser /></TabPane> },
        ] : []),
    ]

    return (<Segment>
        <h1 className="vm-heading">User Details</h1>
        <div className="vm-tabs">
            <Tab menu={{ pointing: true }} grid={{ paneWidth: 12, tabWidth: 5 }} renderActiveOnly={true} panes={panes} />
        </div>
    </Segment>
    );
}