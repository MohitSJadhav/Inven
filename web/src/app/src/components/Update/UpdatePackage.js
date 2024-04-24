import React, { useState } from "react";
import { Dropdown, DropdownItem, Segment, FormField, Form, FormButton } from 'semantic-ui-react';
import { FormControl, MenuItem, InputLabel } from "@mui/material";
import Select from '@mui/material/Select';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { useForm } from 'react-hook-form';

export default function UpdatePackage() {
    const tagOptions = [
        {
            key: 'packagename',
            text: 'Package Name',
            value: 'packagename',
        },
    ]

    // State for search field and selected option
    const [searchFilterValue, setSearchFilterValue] = useState('packagename');
    const [searchValue, setSearchValue] = useState("");
    const [response, setResponseData] = useState("");
    const [permission, setVulStatus] = useState("");

    // axios.defaults.headers.get['Content-Type'] = 'application/x-www-form-urlencoded';


    const { register, handleSubmit, setValue, formState: { errors } } = useForm()
    const formFieldWidth = 4;
    const handlePermission = (e) => setVulStatus(e.target.value)

    const handleSearchValue = (event) => {
        setSearchValue(event.target.value);
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        console.log("search value " + searchFilterValue);

        if (searchValue === "" || searchFilterValue === "") {
            alert('Missing search value. Try searching again!');
        } else {
            try {
                const queryresponse = await axios.get(`http://localhost:8081/api/v1/inventory/package/search?packagename=${searchValue.toLowerCase()}`);

                if (queryresponse.status === 200) {
                    console.log((JSON.stringify(queryresponse.data)));
                    setResponseData(JSON.parse(JSON.stringify(queryresponse)));

                    setValue("packagename", queryresponse.data[0].packagename);
                    setValue("version", queryresponse.data[0].version);
                    setVulStatus("permission", queryresponse.data[0].permission);
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
        formData.append("packageid", response.data[0].packageid)
        formData.append("permission", permission)
        const jsonData = JSON.stringify(Object.fromEntries(formData));
        console.log("Json Data: " + jsonData);
        try {
            const response = await axios.put('http://localhost:8081/api/v1/inventory/package/update', jsonData);
            console.log(response.data);
            if (response.status === 200) {
                alert("Updated Package");
            }
        } catch (error) {
            console.error(error);
            if (error.response.status === 400) {
                alert("Package name already exists or please check all fields");
            }
            if (error.response.status === 500) {
                alert("Error with the server")
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
                        placeholder={"Enter Package Name"}
                        type='text'
                        id="package id"
                        value={searchValue}
                        onChange={handleSearchValue}
                    />
                </FormField>
                <FormButton primary fluid width={2} type='submit' name="button">Search Vulnerability</FormButton>
            </Form>
        </Segment>
        <Segment padded="very">
            <Form onSubmit={handleSubmit(handleUpdateSubmit)}>
                <FormField width={formFieldWidth} required={true}>
                    <label>Package Name</label>
                    <input
                        placeholder="MySQL"
                        type='text'
                        {...register("packagename", { required: true })}
                    />
                    {errors.packagename && <p className="ui negative mini message">Vulnerability Name required</p>}
                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Version</label>
                    <input
                        placeholder="The reason/information of vulnerability is ..."
                        type='text'
                        {...register("version", { required: true })}
                    />
                    {errors.version && <p className="ui negative mini message">required</p>}
                </FormField>

                <div>
                    <FormControl variant="standard" sx={{ m: 1, width: "25%" }}>
                        <InputLabel id="permission_input_label">Permission</InputLabel>
                        <Select
                            labelId="Permission"
                            required={true}
                            slotProps={{
                                textField: {
                                    required: true,
                                },
                            }}
                            value={permission}
                            onChange={handlePermission}
                            label="Permission"
                        >
                            <MenuItem value={"approved"}>Approved</MenuItem>
                            <MenuItem value={"not approved"}>Not Approved</MenuItem>
                        </Select>
                    </FormControl>
                    <br></br>
                </div>

                <FormButton primary fluid width={2} type='submit'>Submit</FormButton>
            </Form>
            <br></br>
        </Segment>
    </>
    );
}


