import React, { useState } from "react";
import { Segment, FormField, Form, FormButton, Dropdown, FormDropdown, DropdownItem, FormSelect, FormTextArea } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { useForm } from "react-hook-form";

export default function AddNetworkConfig() {

    const { register, handleSubmit, formState: { errors } } = useForm()
    const formFieldWidth = 4;

    const onSubmit = async (data) => {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        const jsonData = JSON.stringify(Object.fromEntries(formData));
        console.log("Json Data: " + jsonData);
        try {
            const response = await axios.post('http://localhost:8081/api/v1/inventory/networkconfig/create', jsonData);
            console.log(response.data);
            if (response.status === 200) {
                alert("Added NetworkConfig!");
            }
        } catch (error) {
            console.error(error);
            if (error.response.status === 400) {
                alert("Please check if all fields are valid");
            }
            if (error.response.status === 500) {
                alert("Internal error! Please try again");
            }

        }
    };

    return (
        <Segment padded="very">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormField width={formFieldWidth} required={true}>
                    <label>Host Id</label>
                    <input
                        placeholder=""
                        type='text'
                        {...register("hostid", { required: true })} // pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/ 
                    />
                    {errors.hostid && <p className="ui negative mini message">valid hostid required required</p>}
                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Mac Address</label>
                    <input
                        placeholder=""
                        type='text'
                        {...register("macaddr", { required: true })}
                    />
                    {errors.macaddr && <p className="ui negative mini message">required</p>}
                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Ports</label>
                    <input
                        placeholder=""
                        type='text'
                        {...register("ports", { required: true })}
                    />
                    {errors.ports && <p className="ui negative mini message">required</p>}
                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Subnet Mask</label>
                    <input
                        placeholder=""
                        type='text'
                        {...register("subnetmask", { required: true })}
                    />
                    {errors.subnetmask && <p className="ui negative mini message">required</p>}
                </FormField>


                <FormField width={formFieldWidth} required={true}>
                    <label>DNS Server</label>
                    <input
                        placeholder=""
                        type='text'
                        {...register("dnsserver", { required: true })}
                    />
                    {errors.dnsserver && <p className="ui negative mini message">required</p>}
                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Gateway</label>
                    <input
                        placeholder=""
                        type='text'
                        {...register("gateway", { required: true })}
                    />
                    {errors.gateway && <p className="ui negative mini message">required</p>}
                </FormField>

                <FormButton primary fluid width={2} type='submit'>Add NetworkConfig </FormButton>
            </Form >
        </Segment >
    );
}