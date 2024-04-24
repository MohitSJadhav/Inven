import React, { useState } from "react";
import { Segment, FormField, Form, FormButton, Message, MessageHeader, Confirm } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';

export default function DeleteUser() {
    const [response, setResponse] = useState();
    const [deleteValue, setDeleteValue] = useState("");
    const [isExceptionDeleted, setIsExceptionDeletedValue] = useState(false);
    const [deleteErrorValue, setDeleteErrorValue] = useState();
    const [renderErrorValue, setRenderErrorValue] = useState(false);

    const handleTextChange = (event) => {
        event.preventDefault();
        setDeleteValue(event.target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setDeleteErrorValue(deleteValue);
        let queryresponse = "";
        if (deleteValue === "") {
            alert('Missing Host ID');
        }
        try {
            queryresponse = await axios.delete(`http://localhost:8081/api/v1/inventory/user/remove?email=${deleteValue}`);
            setResponse(JSON.stringify(queryresponse));
            if (queryresponse.status === 200) {
                setIsExceptionDeletedValue(true);
            }
        } catch (error) {
            setIsExceptionDeletedValue(false);
        }
        setRenderErrorValue(true);
        setResponse(JSON.stringify(queryresponse));
    }

    return (
        <>
            <Segment>
                <Form onSubmit={handleSubmit}>
                    <FormField width={5} required={true}>
                        <input
                            id="host id"
                            placeholder="Enter User email"
                            type='text'
                            onChange={handleTextChange}
                        />
                    </FormField>
                    <FormButton primary type="submit" name="button">Delete User</FormButton>
                </Form>
            </Segment>

            {isExceptionDeleted && renderErrorValue ?
                <Message positive>
                    <MessageHeader>Deleted user with email id: {deleteErrorValue}</MessageHeader>
                    <p>Good Job!</p>
                </Message> : <></>}
            {!isExceptionDeleted && renderErrorValue ?
                <Message negative>
                    <MessageHeader>Sorry, we couldn't locate an user with email id: {deleteErrorValue}</MessageHeader>
                    <p>Try checking the email ID entered</p>
                </Message> : <></>}
        </>
    );
}