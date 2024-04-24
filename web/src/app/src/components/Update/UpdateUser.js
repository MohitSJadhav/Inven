import React, { useState } from "react";
import { Dropdown, DropdownItem, Segment, FormField, Form, FormButton } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { useForm } from 'react-hook-form';

import Select from '@mui/material/Select';
import { FormControl, MenuItem, Input, InputLabel } from "@mui/material";

import dayjs from "dayjs";

export default function UpdateUser() {
    const tagOptions = [
        {
            key: 'email',
            text: 'Email ID',
            value: 'email',
        },
    ]

    // State for search field and selected option
    const [searchFilterValue, setSearchFilterValue] = useState('email');
    const [searchValue, setSearchValue] = useState("");
    const [response, setResponseData] = useState("");
    const [dateValue, setDateValue] = useState("");
    const [status, setStatus] = useState("");
    const [groupname, setGroup] = useState("");

    const { register, handleSubmit, setValue, formState: { errors } } = useForm()
    const formFieldWidth = 4;

    const handleSearchValue = (event) => {
        setSearchValue(event.target.value);
    };

    const handleGroupname = (e) => setGroup(e.target.value)
    const handleStatus = (e) => setStatus(e.target.value)

    const onSubmit = async (event) => {
        event.preventDefault();
        console.log("search value " + searchFilterValue);

        if (searchValue === "" || searchFilterValue === "") {
            alert('Missing search value. Try searching again!');
        } else {
            try {
                const queryresponse = await axios.get(`http://localhost:8081/api/v1/inventory/user/search?email=${searchValue.toLowerCase()}&filter=${searchFilterValue.toLowerCase()}`);
                if (queryresponse.status === 200) {
                    console.log((JSON.stringify(queryresponse.data[0])));
                    setResponseData(JSON.parse(JSON.stringify(queryresponse)));

                    setValue("email", queryresponse.data[0].email);
                    setValue("username", queryresponse.data[0].username);
                    setGroup(queryresponse.data[0].groupname);
                    setStatus(queryresponse.data[0].status);
                } else {
                    console.error(queryresponse.status);
                }
            } catch (error) {

            }
        }
    };

    const handleUpdateSubmit = async (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        formData.append("groupname", groupname)
        formData.append("status", status)
        const jsonData = JSON.stringify(Object.fromEntries(formData));
        console.log("Json Data: " + jsonData);
        try {
            const response = await axios.put('http://localhost:8081/api/v1/inventory/user/update', jsonData);
            console.log(response.data);
            if (response.status === 200) {
                alert("Updated User successfully!");
            }
        } catch (error) {
            if (error.response.status === 400) {
                alert("Please check if all fields are valid. Maybe User with same name already exists");
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
                        placeholder={"Enter Email ID"}
                        type='text'
                        id="emailid"
                        value={searchValue}
                        onChange={handleSearchValue}
                    />
                </FormField>
                <FormButton primary fluid width={2} type='submit' name="button">Search User</FormButton>
            </Form>
        </Segment>
        <Segment padded="very">
            <Form onSubmit={handleSubmit(handleUpdateSubmit)}>

                <FormField width={formFieldWidth} required={true}>
                    <label>User Name</label>
                    <input
                        placeholder="username"
                        type='text'
                        {...register("username", { required: true, pattern: /^[a-zA-Z0-9]{6,}$/ })}
                    />
                    {errors.username && <p className="ui negative mini message">minimum 6 alpha num characters required</p>}
                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Email ID</label>
                    <input
                        placeholder="email"
                        type='text'
                        {...register("email", { required: true, pattern: /\w+@gmail\.com/ })}
                    />
                    {errors.email && <p className="ui negative mini message">valid gmail required</p>}
                </FormField>

                <div>
                    <FormControl variant="standard" sx={{ m: 1, width: "25%" }}>
                        <InputLabel id="disk_type_status_input_label">Group Name</InputLabel>
                        <Select
                            labelId="Groupname"
                            required={true}
                            slotProps={{
                                textField: {
                                    required: true,
                                },
                            }}
                            value={groupname}
                            onChange={handleGroupname}
                            label="Groupname"
                        >
                            <MenuItem value={"Admin"}>Admin</MenuItem>
                            <MenuItem value={"Regular User"}>Regular User</MenuItem>
                        </Select>
                    </FormControl>
                    <br></br>
                </div>

                <div>
                    <FormControl variant="standard" sx={{ m: 1, width: "25%" }}>
                        <InputLabel id="serverity_input_label">Status</InputLabel>
                        <Select
                            labelId="status"
                            required={true}
                            slotProps={{
                                textField: {
                                    required: true,
                                },
                            }}
                            value={status}
                            onChange={handleStatus}
                            label="status"
                        >
                            <MenuItem value={"Active"}>Active</MenuItem>
                            <MenuItem value={"InActive"}>InActive</MenuItem>
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


