import React, { useState } from "react";
import { Dropdown, DropdownItem, Segment, FormField, Form, FormButton } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { useForm } from 'react-hook-form';

import Select from '@mui/material/Select';
import { FormControl, MenuItem, InputLabel } from "@mui/material";


export default function UpdateCPu() {
    const tagOptions = [
        {
            key: 'hostid',
            text: 'Host ID',
            value: 'hostid',
        },
    ]

    // State for search field and selected option
    const [searchFilterValue, setSearchFilterValue] = useState('hostid');
    const [searchValue, setSearchValue] = useState("");
    const [response, setResponseData] = useState("");

    const [disktype, setdisktype] = useState("");
    const [size, setSize] = useState("");
    const [numofcores, setCores] = useState("");
    const [memory, setMemory] = useState("");

    const { handleSubmit, formState: { errors } } = useForm()
    const formFieldWidth = 4;

    const handleSearchValue = (event) => {
        setSearchValue(event.target.value);
    };

    const handleDiskType = (e) => setdisktype(e.target.value)
    const handleSize = (e) => setSize(e.target.value)
    const handleCpu = (e) => setCores(e.target.value)
    const handleMemory = (e) => setMemory(e.target.value)

    const onSubmit = async (event) => {
        event.preventDefault();
        console.log("search value " + searchFilterValue);

        if (searchValue === "" || searchFilterValue === "") {
            alert('Missing search value. Try searching again!');
        } else {
            try {
                const queryresponse = await axios.get(`http://localhost:8081/api/v1/inventory/cpudiskmem/search?hostid=${searchValue.toLowerCase()}&filter=${searchFilterValue.toLowerCase()}`);
                if (queryresponse.status === 200) {
                    console.log((JSON.stringify(queryresponse.data[0])));
                    setResponseData(JSON.parse(JSON.stringify(queryresponse.data[0])));

                    setdisktype(queryresponse.data[0].disktype);
                    setSize(queryresponse.data[0].size)
                    setCores(queryresponse.data[0].numofcores)
                    setMemory(queryresponse.data[0].totalmemory)
                } else {
                    console.error(queryresponse.status);
                }
            } catch (error) {

            }
        }
    };

    const handleUpdateSubmit = async (data) => {
        const formData = new FormData();
        console.log(response)
        formData.append("hostid", response["hostid"])
        formData.append("disktype", disktype);
        formData.append("size", size);
        formData.append("numofcores", numofcores);
        formData.append("totalmemory", memory);
        const jsonData = JSON.stringify(Object.fromEntries(formData));
        console.log("Json Data: " + jsonData);
        try {
            const response = await axios.put('http://localhost:8081/api/v1/inventory/cpudiskmem/update', jsonData);
            console.log(response.data);
            if (response.status === 200) {
                alert("Updated Resources for HostID successfully!");
            }
        } catch (error) {
            if (error.response.status === 400) {
                alert("Please check if all fields are valid. Maybe host with same name already exists");
            }
            if (error.response.status === 500) {
                alert("Internal error! Please try again");
            }
            else {
                console.log(error);
            }
        }
    };

    return (<>
        <Segment>
            <Form onSubmit={onSubmit}>
                <div>
                    <Dropdown
                        text='Search By'
                        icon='filter'
                        labeled
                        button
                        floating
                        className='icon'
                        options={tagOptions.map((option) => (<DropdownItem key={option.value} {...option} />))}
                        onChange={(e, data) => setSearchFilterValue(data.value)}
                    />
                </div>
                <br />
                <FormField width={5} required={true}>
                    <input
                        placeholder={"Enter Host ID"}
                        type='text'
                        id="hostid"
                        value={searchValue}
                        onChange={handleSearchValue}
                    />
                </FormField>
                <FormButton primary fluid width={2} type='submit' name="button">Search Resources</FormButton>
            </Form>
        </Segment>
        <Segment padded="very">
            <Form onSubmit={handleSubmit(handleUpdateSubmit)}>

                <div>
                    <FormControl variant="standard" sx={{ m: 1, width: "25%" }}>
                        <InputLabel id="disk_type_status_input_label">Disk Type</InputLabel>
                        <Select
                            labelId="DiskType"
                            required={true}
                            slotProps={{
                                textField: {
                                    required: true,
                                },
                            }}
                            value={disktype}
                            onChange={handleDiskType}
                            label="DiskType"
                        >
                            <MenuItem value={"SSD"}>SSD</MenuItem>
                            <MenuItem value={"HDD"}>HDD</MenuItem>
                        </Select>
                    </FormControl>
                    <br></br>
                </div>

                <div>
                    <FormControl variant="standard" sx={{ m: 1, width: "25%" }}>
                        <InputLabel id="serverity_input_label">Disk Size</InputLabel>
                        <Select
                            labelId="Size"
                            required={true}
                            slotProps={{
                                textField: {
                                    required: true,
                                },
                            }}
                            value={size}
                            onChange={handleSize}
                            label="Size"
                        >
                            <MenuItem value={"1 GB"}>1 GB</MenuItem>
                            <MenuItem value={"2 GB"}>2GB</MenuItem>
                            <MenuItem value={"4 GB"}>4GB</MenuItem>
                            <MenuItem value={"8 GB"}>8 GB</MenuItem>
                            <MenuItem value={"16 GB"}>16 GB</MenuItem>
                            <MenuItem value={"32 GB"}>32 GB</MenuItem>
                            <MenuItem value={"64 GB"}>64 GB</MenuItem>
                            <MenuItem value={"128 GB"}>128 GB</MenuItem>
                            <MenuItem value={"256 GB"}>256 GB</MenuItem>
                            <MenuItem value={"512 GB"}>512 GB</MenuItem>
                            <MenuItem value={"1.2 TB"}>1.2 GB</MenuItem>
                        </Select>
                    </FormControl>
                    <br></br>
                    <br></br>
                </div>

                <div>
                    <FormControl variant="standard" sx={{ m: 1, width: "25%" }}>
                        <InputLabel id="disk_type_status_input_label">Num of Cores</InputLabel>
                        <Select
                            labelId="NumofCores"
                            required={true}
                            slotProps={{
                                textField: {
                                    required: true,
                                },
                            }}
                            value={numofcores}
                            onChange={handleCpu}
                            label="NumofCores"
                        >
                            <MenuItem value={"2"}>2</MenuItem>
                            <MenuItem value={"4"}>4</MenuItem>
                            <MenuItem value={"8"}>8</MenuItem>
                            <MenuItem value={"16"}>16</MenuItem>
                        </Select>
                    </FormControl>
                    <br></br>
                </div>

                <div>
                    <FormControl variant="standard" sx={{ m: 1, width: "25%" }}>
                        <InputLabel id="serverity_input_label">Total Memory</InputLabel>
                        <Select
                            labelId="Memory"
                            required={true}
                            slotProps={{
                                textField: {
                                    required: true,
                                },
                            }}
                            value={memory}
                            onChange={handleMemory}
                            label="Memory"
                        >
                            <MenuItem value={"1 GB"}>1 GB</MenuItem>
                            <MenuItem value={"2 GB"}>2GB</MenuItem>
                            <MenuItem value={"4 GB"}>4GB</MenuItem>
                            <MenuItem value={"8 GB"}>8 GB</MenuItem>
                            <MenuItem value={"16 GB"}>16 GB</MenuItem>
                            <MenuItem value={"32 GB"}>32 GB</MenuItem>
                        </Select>
                    </FormControl>
                    <br></br>
                    <br></br>
                </div>

                <FormButton primary fluid width={2} type='submit'>Submit</FormButton>
            </Form>
            <br></br>
        </Segment>
    </>
    );
}


