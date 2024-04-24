/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";
import MenuDrawer from '../../MenuDrawer';
import { Divider } from "@mui/material";
import './PageLayout.css';

/**
 * Renders the navbar component with a sign in or sign out button depending on whether or not a user is authenticated
 * @param props
 */
export const PageLayout = (props) => {
    // const [isAuthenticated, setUserAuthenticated] = useState(true);
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const isAdmin = sessionStorage.getItem("isAdmin");
    const loggedUser = sessionStorage.getItem("loggedUser");
    // const [user, setUser] = useState("Mohit");
    return (
        <>
            <Navbar className="headline" style={{ fontFamily: "Gotham Light", height: "60px" }}>
                {isLoggedIn ? <MenuDrawer></MenuDrawer> : <h6 style={{ marginLeft: "10px" }}></h6>}
                {/* <a href="/"><img alt="Tesla-Logo" src={logo} /></a> */}

                <Divider orientation="vertical" color="white" flexItem />
                <h3 style={{ color: "white", fontFamily: "Gotham Light", marginLeft: "10px", fontSize: "150%" }} className="justify-content-end">VM Inventory Manager</h3>
                {isLoggedIn ? [<h6 style={{ color: "white", marginLeft: "auto", paddingTop: "5px" }}>  Welcome, {loggedUser}</h6>, <SignOutButton />] : <div className=" collapse navbar-collapse justify-content-end" ><SignInButton /></div>}

            </Navbar >
            <br />
            {props.children}
        </>
    );
};