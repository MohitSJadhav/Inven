import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import Button from 'react-bootstrap/Button';

/**
 * Renders a drop down button with child buttons for logging in with a popup or redirect
 * Note the [useMsal] package 
 */

export const SignInButton = () => {

    const handleLogin = () => {
        window.location.href = ("/"); // Redirect to home page on successful signin
    };
    return (
        <Button type="button" onClick={() => handleLogin()} style={{ marginRight: "10px", marginLeft: "10px", width: "fit-content" }}>Sign In</Button>
    );
};