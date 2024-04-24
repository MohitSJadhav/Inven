import React, { useState } from 'react';
import { Dropdown, Message, MessageHeader, DropdownItem, Segment, FormField, Form, FormButton, ListHeader, List, ListItem, ListContent, Grid, GridColumn } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';

export default function Lookup() {

    const tagOptions = [
        {
            key: 'hostid',
            text: 'VM Id',
            value: 'hostid',
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
                const queryresponse = await axios.get(`http://localhost:8081/api/v1/inventory/vm/lookup?hostid=${searchValue.toLowerCase()}&filter=${searchFilterValue.toLowerCase()}`);
                if (queryresponse.status === 200) {
                    // console.log(typeof JSON.stringify(queryresponse.data));
                    console.log(JSON.parse(JSON.stringify(queryresponse.data.hostdata["hostname"])));
                    setResponseData(JSON.parse(JSON.stringify(queryresponse)));
                    setResponseReceived(true);
                    // return

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
                    {/* {response.data.hostdata.map((value, index) => { */}
                    <Segment padded='very'><ListItem>
                        <Grid columns={5}>
                            <GridColumn><ListContent><ListHeader ><h4>Host ID</h4></ListHeader>{response.data.hostdata["hostid"]}</ListContent><br></br></GridColumn>
                            <GridColumn><ListContent><ListHeader ><h4>Hostname</h4></ListHeader>{response.data.hostdata["hostname"]}</ListContent><br></br></GridColumn>
                            <GridColumn><ListContent><ListHeader><h4>Region</h4></ListHeader>{response.data.hostdata["region"]}</ListContent><br></br></GridColumn>
                            <GridColumn><ListContent><ListHeader><h4>Datacenter</h4></ListHeader>{response.data.hostdata["datacenter"]}</ListContent><br></br></GridColumn>
                        </Grid>
                        <Grid columns={5}>
                            <GridColumn><ListContent><ListHeader><h4>OS</h4></ListHeader>{response.data.hostdata["os"]}</ListContent><br></br></GridColumn>
                            <GridColumn><ListContent><ListHeader><h4>Environment</h4></ListHeader>{response.data.hostdata["environment"]}</ListContent><br></br></GridColumn>
                            <GridColumn><ListContent><ListHeader><h4>Ip</h4></ListHeader>{response.data.hostdata["ip"]}</ListContent><br></br></GridColumn>
                            <GridColumn><ListContent><ListHeader><h4>Owners</h4></ListHeader>{response.data.hostdata["owners"]}</ListContent></GridColumn>
                            <GridColumn><ListContent><ListHeader><h4>Status</h4></ListHeader>{response.data.hostdata["status"]}</ListContent></GridColumn>
                        </Grid>
                    </ListItem>
                    </Segment>

                    <Segment padded='very'><ListItem >
                        <Grid columns={5}>
                            <GridColumn><ListContent><ListHeader ><h4>Disk Type</h4></ListHeader>{response.data.cpudiskmemdata["disktype"]}</ListContent><br></br></GridColumn>
                            <GridColumn><ListContent><ListHeader><h4>Disk Size</h4></ListHeader>{response.data.cpudiskmemdata["size"]}</ListContent><br></br></GridColumn>
                            <GridColumn><ListContent><ListHeader><h4>Number of Cores</h4></ListHeader>{response.data.cpudiskmemdata["numofcores"]}</ListContent><br></br></GridColumn>
                            <GridColumn><ListContent><ListHeader><h4>Total Memory</h4></ListHeader>{response.data.cpudiskmemdata["totalmemory"]}</ListContent><br></br></GridColumn>
                        </Grid>
                    </ListItem>
                    </Segment>

                    <Segment padded='very'><ListItem>
                        <Grid columns={5}>
                            <GridColumn><ListContent><ListHeader ><h4>DNS Server</h4></ListHeader>{response.data.networkdata["DnsServer"]}</ListContent><br></br></GridColumn>
                            <GridColumn><ListContent><ListHeader><h4>Gateway</h4></ListHeader>{response.data.networkdata["Gateway"]}</ListContent><br></br></GridColumn>
                            <GridColumn><ListContent><ListHeader><h4>Mac Address</h4></ListHeader>{response.data.networkdata["MacAddr"]}</ListContent><br></br></GridColumn>
                            <GridColumn><ListContent><ListHeader><h4>Ports</h4></ListHeader>{response.data.networkdata["Ports"]}</ListContent><br></br></GridColumn>
                            <GridColumn><ListContent><ListHeader><h4>Subnet Mask</h4></ListHeader>{response.data.networkdata["SubnetMask"]}</ListContent><br></br></GridColumn>
                        </Grid>
                    </ListItem>
                    </Segment>
                    <Segment padded='very'>
                        {response.data.packagedata.map((value, index) => {
                            return <ListItem key={index} >
                                <Grid columns={5}>
                                    <GridColumn><ListContent><ListHeader ><h4>Package ID</h4></ListHeader>{value.packageid}</ListContent><br></br></GridColumn>
                                    <GridColumn><ListContent><ListHeader ><h4>Package Name</h4></ListHeader>{value.packagename}</ListContent><br></br></GridColumn>
                                    <GridColumn><ListContent><ListHeader><h4>Permission</h4></ListHeader>{value.permission}</ListContent><br></br></GridColumn>
                                    <GridColumn><ListContent><ListHeader><h4>Version</h4></ListHeader>{value.version}</ListContent><br></br></GridColumn>
                                </Grid>
                            </ListItem>

                        })}
                    </Segment>
                    <Segment padded='very'>
                        {response.data.vulnerabilitydata.map((value, index) => {
                            return <ListItem key={index} >
                                <Grid columns={6}>
                                    <GridColumn><ListContent><ListHeader ><h4>Vulnerability ID</h4></ListHeader>{value.vulnerability_id}</ListContent><br></br></GridColumn>
                                    <GridColumn><ListContent><ListHeader ><h4>Vulnerability Name</h4></ListHeader>{value.vulnerabilityname}</ListContent><br></br></GridColumn>
                                    <GridColumn><ListContent><ListHeader><h4>Severity</h4></ListHeader>{value.severity}</ListContent><br></br></GridColumn>
                                    <GridColumn><ListContent><ListHeader><h4>Status</h4></ListHeader>{value.status}</ListContent><br></br></GridColumn>
                                    <GridColumn><ListContent><ListHeader ><h4>Detection Date</h4></ListHeader>{value.detectiondate}</ListContent><br></br></GridColumn>
                                    <GridColumn><ListContent><ListHeader ><h4>Description</h4></ListHeader>{value.description}</ListContent><br></br></GridColumn>
                                </Grid>
                            </ListItem>

                        })}
                    </Segment>

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
