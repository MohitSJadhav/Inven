import React from "react";
import { useState } from "react";
import { Message, MessageHeader, Segment, FormField, Form, FormButton } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';

export default function DeleteVM() {
    // State for the Virtual Machine ID to be deleted and any errors that may occur during deletion
    const [deleteValue, setDeleteValue] = useState("");
    const [exceptionDeleted, setExceptionDeletedValue] = useState(false);
    const [deleteErrorValue, setDeleteErrorValue] = useState();
    const [renderErrorValue, setRenderErrorValue] = useState(false);

    const handleTextChange = (event) => {
        event.preventDefault();
        setDeleteValue(event.target.value);

    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setDeleteErrorValue(deleteValue);
        console.log('Delete Button was clicked!');
        if (deleteValue === "") {
            alert('Empty VM ID to be deleted!');
            return
        }
        try {
            const queryresponse = await axios.delete(`http://localhost:8081/api/v1/inventory/vm/remove?vmid=${deleteValue}`);
            console.log(JSON.stringify(queryresponse))
            if (queryresponse.status === 200) {
                setExceptionDeletedValue(true)
            }
        } catch (error) {
            setExceptionDeletedValue(false);
        }
        setRenderErrorValue(true);
    }

    return (
        <Segment>
            <Form onSubmit={handleSubmit}>
                <FormField fluid width={5} required={true}>
                    <input
                        placeholder="Enter VM ID"
                        type='text'
                        onChange={handleTextChange}
                    />
                </FormField>
                <FormButton primary type="submit" name="button">Delete</FormButton>
            </Form>
            {exceptionDeleted && renderErrorValue ?
                <Message positive>
                    <MessageHeader>Deleted VM with ID: {deleteErrorValue}</MessageHeader>
                    <p>Good Job!</p>
                </Message> : <h3></h3>}
            {!exceptionDeleted && renderErrorValue ?
                <Message negative>
                    <MessageHeader>Sorry, we couldn't locate a VM with ID: {deleteErrorValue}</MessageHeader>
                    <p>Try checking the VM ID entered</p>
                </Message> : <></>}
        </Segment>
    );
}
