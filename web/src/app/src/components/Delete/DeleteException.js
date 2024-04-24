import React, { useState } from "react";
import { Segment, FormField, Form, FormButton, Message, MessageHeader, Confirm } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';

export default function DeleteException() {
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
            alert('Missing exception ID');
        }
        try {
            queryresponse = await axios.delete(`http://vm12mj-2lply.us-dal11.compute.cssp.tzla.net:8081/api/v1/inventory/vms/exception/remove?exception_id=${deleteValue}`);
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
                            id="exception id"
                            placeholder="Enter Exception ID"
                            type='text'
                            onChange={handleTextChange}
                        />
                    </FormField>
                    <FormButton primary type="submit" name="button">Delete</FormButton>
                </Form>
            </Segment>

            {isExceptionDeleted && renderErrorValue ?
                <Message positive>
                    <MessageHeader>Deleted Exception with id: {deleteErrorValue}</MessageHeader>
                    <p>Good Job!</p>
                </Message> : <></>}
            {!isExceptionDeleted && renderErrorValue ?
                <Message negative>
                    <MessageHeader>Sorry, we couldn't locate an Exception with id: {deleteErrorValue}</MessageHeader>
                    <p>Try checking the Exception ID entered</p>
                </Message> : <></>}
        </>
    );
}