import React, { useState } from "react";
import { Dropdown, DropdownItem, MessageHeader, Message, Segment, FormField, Form, FormButton, ListHeader, List, ListItem, ListContent } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { GridColumn, Grid } from "semantic-ui-react";


export default function SearchPackage() {
    const tagOptions = [
        {
            key: 'packagename',
            text: 'Package Name',
            value: 'packagename',
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
    const [searchFilterValue, setSearchFilterValue] = useState('vulnerabilityid');
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
        if (searchValue === "") {
            // TODO: add message here
            alert('Missing search value. Try searching again!');
            setResponseReceived(false)
        } else {
            try {
                const queryresponse = await axios.get(`http://localhost:8081/api/v1/inventory/package/search?packagename=${searchValue}`);
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

            }
        }
    };

    return (<>
        <Segment>
            <Form onSubmit={handleSubmit}>

                <br />
                <FormField width={5} required={true}>
                    <input
                        placeholder="Enter value..."
                        type='text'
                        id="package"
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
                                        <GridColumn><ListContent><ListHeader ><h4>Package Name</h4></ListHeader>{value.packageid}</ListContent><br></br></GridColumn>
                                        <GridColumn><ListContent><ListHeader ><h4>Package Id</h4></ListHeader>{value.packagename}</ListContent><br></br></GridColumn>
                                        <GridColumn><ListContent><ListHeader><h4>Permission</h4></ListHeader>{value.permission}</ListContent><br></br></GridColumn>
                                        <GridColumn><ListContent><ListHeader><h4>Update At</h4></ListHeader>{value.updatedate}</ListContent><br></br></GridColumn>
                                        <GridColumn><ListContent><ListHeader><h4>Version</h4></ListHeader>{value.version}</ListContent><br></br></GridColumn>
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
