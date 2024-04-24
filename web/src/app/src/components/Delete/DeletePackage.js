import React, { useState } from "react";
import { Segment, FormField, Form, FormButton, Message, MessageHeader, Confirm } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';

export default function DeletePackage() {
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
            alert('Missing Package ID');
        }
        try {
            queryresponse = await axios.delete(`http://localhost:8081/api/v1/inventory/package/remove?packageid=${deleteValue}`);
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
                            id="packageid"
                            placeholder="Enter Package ID"
                            type='text'
                            onChange={handleTextChange}
                        />
                    </FormField>
                    <FormButton primary type="submit" name="button">Delete Vulnerability</FormButton>
                </Form>
            </Segment>

            {isExceptionDeleted && renderErrorValue ?
                <Message positive>
                    <MessageHeader>Deleted Package with id: {deleteErrorValue}</MessageHeader>
                    <p>Good Job!</p>
                </Message> : <></>}
            {!isExceptionDeleted && renderErrorValue ?
                <Message negative>
                    <MessageHeader>Sorry, we couldn't locate an Package with id: {deleteErrorValue}</MessageHeader>
                    <p>Try checking the Package ID entered</p>
                </Message> : <></>}
        </>
    );
}