import React, { useState } from "react";
import { Dropdown, DropdownItem, Segment, FormField, Form, FormGroup, FormButton } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { useForm } from 'react-hook-form';


export default function UpdateVM() {
    const tagOptions = [
        {
            key: 'id',
            text: 'VM ID',
            value: 'id',
        },
    ]

    // State for search field and selected option
    const [searchFilterValue, setSearchFilterValue] = useState('id');
    const [searchValue, setSearchValue] = useState("");
    const [response, setResponseData] = useState("");

    const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm()
    const formFieldWidth = 4;

    const handleSearchValue = (event) => {
        setSearchValue(event.target.value);
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        if (searchValue === "" || searchFilterValue === "") {
            alert('Missing search value. Try searching again!');
        } else {
            try {
                const queryresponse = await axios.get(`http://localhost:8081/api/v1/inventory/vm/search?hostname=${searchValue.toLowerCase()}&filter=${searchFilterValue.toLowerCase()}`);
                if (queryresponse.status === 200) {
                    setResponseData(JSON.parse(JSON.stringify(queryresponse)));
                    setValue("hostname", queryresponse.data.data[0].hostname);
                    setValue("region", queryresponse.data.data[0].region);
                    setValue("datacenter", queryresponse.data.data[0].datacenter);
                    setValue("os", queryresponse.data.data[0].os);
                    setValue("owners", queryresponse.data.data[0].owners);
                    setValue("environment", queryresponse.data.data[0].environment);
                    setValue("ip", queryresponse.data.data[0].ip);
                    setValue("status", queryresponse.data.data[0].status);

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
            console.log(key + "=" + value);
        });
        formData.append("hostid", searchValue)
        const jsonData = JSON.stringify(Object.fromEntries(formData));
        try {
            const response = await axios.put('http://localhost:8081/api/v1/inventory/vm/update', jsonData);

            if (response.status === 200) {
                alert("Updated VM data");
            }
        } catch (error) {
            alert("Error updating VM");
        }
    };


    return (<Segment>
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
                        placeholder={"Enter " + searchFilterValue.toUpperCase()}
                        type='text'
                        id="vm"
                        value={searchValue}
                        onChange={handleSearchValue}
                    />
                </FormField>
                <FormButton primary fluid width={2} type='submit' name="button">Search</FormButton>
            </Form>
        </Segment>
        <Segment padded="very">
            <Form onSubmit={handleSubmit(handleUpdateSubmit)}>
                <FormField width={formFieldWidth} required={true}>
                    <label>Hostname</label>
                    <input
                        placeholder="hostname"
                        type='text'
                        {...register("hostname", { required: true })}
                    />
                    {errors.hostname && <p className="ui negative mini message">required hostname</p>}
                </FormField>

                <FormGroup unstackable>

                    <FormField width={formFieldWidth} required={true}>
                        <label>Region</label>
                        <input
                            placeholder="region"
                            type='text'
                            {...register("region", { required: true })}
                        />
                        {errors.region && <p className="ui negative mini message">region required</p>}
                    </FormField>

                    <FormField width={formFieldWidth} required={true}>
                        <label>Datacenter</label>
                        <input
                            placeholder="datacenter"
                            type='text'
                            {...register("datacenter", { required: true })}
                        />
                        {errors.datacenter && <p className="ui negative mini message">datacenter required</p>}
                    </FormField>
                </FormGroup>

                <FormField width={formFieldWidth} required={true}>
                    <label>OS</label>
                    <input
                        placeholder="Ubuntu"
                        type='text'
                        {...register("os", { required: true })}
                    />
                    {errors.os && <p className="ui negative mini message">Operating system required</p>}
                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Environment</label>
                    <input
                        placeholder="Production"
                        type='text'
                        {...register("environment", { required: true })}
                    />
                    {errors.environment && <p className="ui negative mini message">Environment required</p>}
                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Owners</label>
                    <input
                        placeholder="user1@gmail.com,user2@gmail.com"
                        type='text'
                        {...register("owners", { required: true, pattern: /\w+@gmail\.com(,*\s*\w+@gmail\.com)*/ })}
                    />
                    {errors.owners && <p className="ui negative mini message">owners required and separated by comma with no spaces in between</p>}
                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Ip</label>
                    <input
                        placeholder="XXX.XXX.XXX.XXX"
                        type='text'
                        {...register("ip", { required: true, pattern: /^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/ })}
                    />
                    {errors.ip && <p className="ui negative mini message">IP address required with correct format</p>}
                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Status</label>
                    <input
                        placeholder="active or nonactive"
                        type='text'
                        {...register("status", { required: true, pattern: /^(active|inactive)$/ })}
                    />
                    {errors.status && <p className="ui negative mini message">active or inactive</p>}
                </FormField>

                <FormButton primary fluid width={2} type='submit' onSubmit={handleSubmit(handleUpdateSubmit)}>Submit</FormButton>
            </Form>
        </Segment>

    </Segment>
    );
}
