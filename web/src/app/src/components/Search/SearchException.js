import React, { useState } from "react";
import { Dropdown, DropdownItem, MessageHeader, Message, Segment, FormField, Form, FormButton, ListHeader, List, ListItem, ListContent } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';


export default function SearchException() {
    const tagOptions = [
        {
            key: 'exception_id',
            text: 'Exception ID',
            value: 'exception_id',
        },
        {
            key: 'expiry_date',
            text: 'Expiry Date',
            value: 'expiry_date',
        },
        {
            key: 'approved_by',
            text: 'Approver',
            value: 'approved_by',
        },
        {
            key: 'vmid_fk',
            text: 'VM ID',
            value: 'vmid_fk',
        }
    ]

    // State for search field and selected option
    const [searchFilterValue, setSearchFilterValue] = useState('exception_id');
    const [searchValue, setSearchValue] = useState("");
    const [response, setResponseData] = useState("");
    let [responseReceived, setResponseReceived] = useState(false);
    let [responseErrorReceived, setResponseErrorReceived] = useState(false);
    const [searchErrorValue, setSearchErrorValue] = useState();

    const handleSearchValue = (event) => {
        setSearchValue(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSearchErrorValue(searchValue);
        console.log("search value " + searchFilterValue);
        if (searchValue === "" || searchFilterValue === "") {
            // TODO: add message here
            alert('Missing search value. Try searching again!');
            setResponseReceived(false)
        } else {
            try {
                const queryresponse = await axios.get(`http://vm12mj-2lply.us-dal11.compute.cssp.tzla.net:8081/api/v1/inventory/vms/exception/search?value=${searchValue.toLowerCase()}&filterby=${searchFilterValue.toLowerCase()}`);
                console.log(typeof (queryresponse.data.data))
                if (queryresponse.status === 200) {
                    // console.log("LENGTH: " + queryresponse.data.data.length)
                    if (queryresponse.data.data === null) {
                        setResponseErrorReceived(true)
                        setResponseReceived(false);
                    } else {
                        setResponseReceived(true);
                        setResponseErrorReceived(false);
                        setResponseData(JSON.parse(JSON.stringify(queryresponse)));
                    }
                } else {
                    console.error(queryresponse.status);
                }
            } catch (error) {

            }
        }
    };

    return (<>
        <Segment>
            <Form onSubmit={handleSubmit}>
                <div>
                    <Dropdown
                        text='Search By'
                        icon='filter'
                        labeled
                        button
                        className='icon'
                        options={tagOptions.map((option) => (<DropdownItem key={option.value} {...option} />))}
                        onChange={(e, data) => setSearchFilterValue(data.value)}
                    />
                </div>
                <br />
                <FormField width={5} required={true}>
                    <input
                        placeholder="Enter value..."
                        type='text'
                        id="exception"
                        value={searchValue}
                        onChange={handleSearchValue}
                    />
                </FormField>
                <FormButton primary fluid width={2} type='submit' name="button">Search</FormButton>
            </Form>
        </Segment>

        {
            responseReceived ?
                <>
                    <List divided={true}>
                        {response.data.data.map((value, index) => {
                            return <Segment padded='very'>
                                <ListItem key={index} >
                                    <ListContent><ListHeader ><h4>Exception ID</h4></ListHeader>{value.exception_id}</ListContent><br></br>
                                    <ListContent><ListHeader ><h4>VM ID</h4></ListHeader>{value.vmid_fk}</ListContent><br></br>
                                    <ListContent><ListHeader><h4>Approver(s)</h4></ListHeader>{value.approved_by}</ListContent><br></br>
                                    <ListContent><ListHeader><h4>Exception Status</h4></ListHeader>{value.exception_status}</ListContent><br></br>
                                    <ListContent><ListHeader><h4>Reason</h4></ListHeader>{value.reason}</ListContent><br></br>
                                    <ListContent><ListHeader><h4>Jira</h4></ListHeader>{value.jira}</ListContent><br></br>
                                    <ListContent><ListHeader><h4>Exception Tag</h4></ListHeader>{value.exception_tag}</ListContent><br></br>
                                    <ListContent><ListHeader><h4>Expires On</h4></ListHeader>{value.expiry_date}</ListContent><br></br>
                                </ListItem>
                            </Segment>
                        })}
                    </List>
                </>
                : <>
                </>
        }
        {
            responseErrorReceived ? <><Message negative>
                <MessageHeader>Sorry, we couldn't find - {searchErrorValue}</MessageHeader>
                <p>Try checking the filter value again</p>
            </Message></> : <></>
        }
    </ >
    );
}
