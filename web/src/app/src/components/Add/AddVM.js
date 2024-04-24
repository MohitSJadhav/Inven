import React, { useState } from "react";
import { Segment, FormField, Form, FormGroup, FormButton } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { useForm } from 'react-hook-form';


export default function AddVM() {

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
            const response = await axios.post('http://localhost:8081/api/v1/inventory/vm/create', jsonData);
            console.log(response.data);
            if (response.status === 200) {
                alert("Added VM");
                console.log("Added vm")
            }
        } catch (error) {
            console.error(error);
            alert("Failed to add VM to DB. Either the VM already exists or there was a server error.");
        }
    };

    return (
        <Segment>
            <Form onSubmit={handleSubmit(onSubmit)}>

                <FormField width={formFieldWidth} required={true} >
                    <label>Hostname</label>
                    <input
                        placeholder="hostname"
                        type='text'
                        {...register("hostname", { required: true })}
                    />
                    {errors.hostname && <p className="ui negative mini message">hostname required</p>}
                </FormField>


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

                <FormField width={formFieldWidth} required={false}>
                    <label>Ip</label>
                    <input
                        placeholder="XXX.XXX.XXX.XXX"
                        type='text'
                        {...register("ip", { required: false, pattern: /^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/ })}
                    />
                    {errors.ip && <p className="ui negative mini message">IP address required with correct format</p>}

                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Status</label>
                    <input
                        placeholder="active or inactive"
                        type='text'
                        {...register("status", { required: true, pattern: /^(active|inactive)$/ })}
                    />
                    {errors.status && <p className="ui negative mini message">Status as active or inactive</p>}
                </FormField>

                <FormButton primary fluid width={2} type='submit' onSubmit={handleSubmit(onSubmit)}>Submit</FormButton>
            </Form>
        </Segment>
    );

}
