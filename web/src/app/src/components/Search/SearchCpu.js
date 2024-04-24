import React, { useState } from "react";
import { Dropdown, DropdownItem, MessageHeader, Message, Segment, FormField, Form, FormButton, ListHeader, List, ListItem, ListContent } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { GridColumn, Grid } from "semantic-ui-react";


export default function LookupCpu() {
    const tagOptions = [
        {
            key: 'hostid',
            text: 'Host ID',
            value: 'hostid',
        }
        // {
        //     key: 'vulnerabilityname',
        //     text: 'Vulnerability Name',
        //     value: 'vulnerabilityname',
        // },
        // {
        //     key: 'status',
        //     text: 'Status',
        //     value: 'status',
        // },
        // {
        //     key: 'severity',
        //     text: 'Severity',
        //     value: 'severity',
        // }
    ]

    // State for search field and selected option
    const [searchFilterValue, setSearchFilterValue] = useState('hostid');
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
                const queryresponse = await axios.get(`http://localhost:8081/api/v1/inventory/cpudiskmem/search?hostid=${searchValue}&filter=${searchFilterValue}`);
                console.log((queryresponse.data))
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
                if (error.response.status === 400) {
                    alert("Invalid input!");
                }
                if (error.response.status === 500) {
                    alert("Internal Server Error!");
                }
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
                        placeholder="Enter HostID..."
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
                        {response.data.map((value, index) => {
                            return <Segment padded='very'>
                                <ListItem key={index} >
                                    <Grid columns={6}>
                                        <GridColumn><ListContent><ListHeader ><h4>Host ID</h4></ListHeader>{value.hostid}</ListContent><br></br></GridColumn>
                                        <GridColumn><ListContent><ListHeader ><h4>Disk Type</h4></ListHeader>{value.disktype}</ListContent><br></br></GridColumn>
                                        <GridColumn><ListContent><ListHeader><h4>Disk Size</h4></ListHeader>{value.size}</ListContent><br></br></GridColumn>
                                        <GridColumn><ListContent><ListHeader><h4>Number of Cores</h4></ListHeader>{value.numofcores}</ListContent><br></br></GridColumn>
                                        <GridColumn><ListContent><ListHeader><h4>Total Memory</h4></ListHeader>{value.totalmemory}</ListContent><br></br></GridColumn>
                                        <GridColumn><ListContent><ListHeader><h4>Update Date</h4></ListHeader>{value.updated_at}</ListContent><br></br></GridColumn>
                                    </Grid>
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
