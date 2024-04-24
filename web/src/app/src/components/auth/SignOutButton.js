import React from "react";
import { useMsal } from "@azure/msal-react";
import Button from "react-bootstrap/Button";

/**
 * Renders a sign out button 
 */
export const SignOutButton = () => {
    const { instance } = useMsal();
    const handleLogout = () => {
        sessionStorage.removeItem("isLoggedIn", "");
        sessionStorage.removeItem("isAdmin", "");
        sessionStorage.removeItem("loggedUser", "");
        window.location.href = "/";

    };
    return (
        <Button primary type="button" onClick={() => handleLogout()} style={{
            marginLeft: "10px", marginRight: "10px", width: "fit-content"
        }}>
            Sign Out
        </Button >
    );
};