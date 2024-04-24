import React, { useState } from 'react';
import { Dropdown, Message, MessageHeader, DropdownItem, Segment, FormField, Form, FormButton, ListHeader, List, ListItem, ListContent, Grid, GridColumn } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';

export default function SearchVM() {

    const tagOptions = [
        {
            key: 'hostname',
            text: 'Host name',
            value: 'hostname',
        },
        {
            key: 'datacenter',
            text: 'Datacenter',
            value: 'datacenter',
        },
        {
            key: 'ip',
            text: 'Ip address',
            value: 'ip',
        },
        {
            key: 'id',
            text: 'VM Id',
            value: 'id',
        }

    ]

    // State for search field and selected option
    const [searchFilterValue, setSearchFilterValue] = useState('hostid');
    const [searchValue, setSearchValue] = useState("");
    const [response, setResponseData] = useState("");
    const [responseReceived, setResponseReceived] = useState(false);
    const [isSearchLoaded, setIsSearchLoaded] = useState(false);
    const [searchErrorMsgValue, setSearchErrorMsgValue] = useState("");

    const handleSearchValue = (event) => {
        setSearchValue(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // console.log("search value " + searchFilterValue);
        if (searchValue === "" || searchFilterValue === "") {
            alert('Missing search value. Try searching again!');
            setResponseReceived(false)
        } else {
            try {
                const queryresponse = await axios.get(`http://localhost:8081/api/v1/inventory/vm/search?hostname=${searchValue.toLowerCase()}&filter=${searchFilterValue.toLowerCase()}`);
                if (queryresponse.status === 200) {
                    // console.log(typeof JSON.stringify(queryresponse.data));
                    console.log(JSON.parse(JSON.stringify(queryresponse)));
                    setResponseData(JSON.parse(JSON.stringify(queryresponse)));
                    setResponseReceived(true);

                } else {
                    console.error(queryresponse.status);
                }
            } catch (error) {
                setResponseReceived(false);
            }
            setSearchErrorMsgValue(searchValue);
            setIsSearchLoaded(true);
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
                        placeholder={"Enter value..."}
                        type='text'
                        value={searchValue}
                        onChange={handleSearchValue}
                    />

                </FormField>
                <FormButton primary fluid width={2} type='submit' name="button">Search</FormButton>
            </Form>
        </Segment>

        {responseReceived && isSearchLoaded ?
            <>
                <List>
                    {response.data.data.map((value, index) => {
                        return <Segment padded='very'><ListItem key={index} >
                            <Grid columns={5}>
                                <GridColumn><ListContent><ListHeader ><h4>Host ID</h4></ListHeader>{value.hostid}</ListContent><br></br></GridColumn>
                                <GridColumn><ListContent><ListHeader ><h4>Hostname</h4></ListHeader>{value.hostname}</ListContent><br></br></GridColumn>
                                <GridColumn><ListContent><ListHeader><h4>Region</h4></ListHeader>{value.region}</ListContent><br></br></GridColumn>
                                <GridColumn><ListContent><ListHeader><h4>Datacenter</h4></ListHeader>{value.datacenter}</ListContent><br></br></GridColumn>
                            </Grid>
                            <Grid columns={5}>
                                <GridColumn><ListContent><ListHeader><h4>OS</h4></ListHeader>{value.os}</ListContent><br></br></GridColumn>
                                <GridColumn><ListContent><ListHeader><h4>Environment</h4></ListHeader>{value.environment}</ListContent><br></br></GridColumn>
                                <GridColumn><ListContent><ListHeader><h4>Ip</h4></ListHeader>{value.ip}</ListContent><br></br></GridColumn>
                                <GridColumn><ListContent><ListHeader><h4>Owners</h4></ListHeader>{value.owners}</ListContent></GridColumn>
                                <GridColumn><ListContent><ListHeader><h4>Status</h4></ListHeader>{value.status}</ListContent></GridColumn>
                            </Grid>
                        </ListItem>
                        </Segment>
                    })}
                </List>
            </>
            : <></>}
        {!responseReceived && isSearchLoaded ? <>
            <Message negative>
                <MessageHeader>Sorry, we couldn't find - {searchErrorMsgValue}</MessageHeader>
                <p>Try checking the filter value again</p>
            </Message>
        </> : <></>}
    </>
    );
}
