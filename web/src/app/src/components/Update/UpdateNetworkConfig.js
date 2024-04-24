import React, { useState } from "react";
import { Dropdown, DropdownItem, Segment, FormField, Form, FormButton } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

export default function UpdateNetworkConfig() {
    const tagOptions = [
        {
            key: 'hostid',
            text: 'Host ID',
            value: 'hostid',
        },
    ]

    // State for search field and selected option
    const [searchFilterValue, setSearchFilterValue] = useState('exception_id');
    const [searchValue, setSearchValue] = useState("");
    const [response, setResponseData] = useState("");
    const [dateValue, setDateValue] = useState();

    // axios.defaults.headers.get['Content-Type'] = 'application/x-www-form-urlencoded';


    const { register, handleSubmit, setValue, formState: { errors } } = useForm()
    const formFieldWidth = 4;

    const handleSearchValue = (event) => {
        setSearchValue(event.target.value);
    };



    // HostId     string `json: "hostid"`
    // MacAddr    string `json: "macaddr"`
    // Ports      string `json: "ports"`
    // SubnetMask string `json: "subnetmask"`
    // DnsServer  string `json: "dnsserver"`
    // UpdateDate string `json: "updatedate"`
    // Gateway    string `json: "gateway" `

    const onSubmit = async (event) => {
        event.preventDefault();
        console.log("search value " + searchFilterValue);

        if (searchValue === "" || searchFilterValue === "") {
            alert('Missing search value. Try searching again!');
        } else {
            try {
                const queryresponse = await axios.get(`http://localhost:8081/api/v1/inventory/networkconfig/search?hostid=${searchValue.toLowerCase()}&filterby=${searchFilterValue.toLowerCase()}`);
                if (queryresponse.status === 200) {
                    console.log((JSON.stringify(queryresponse.data[0])));
                    setResponseData(JSON.parse(JSON.stringify(queryresponse)));

                    setValue("macaddr", queryresponse.data[0].MacAddr);
                    setValue("ports", queryresponse.data[0].Ports);
                    setValue("subnetmask", queryresponse.data[0].SubnetMask);
                    setValue("dnsserver", queryresponse.data[0].DnsServer);
                    setValue("gateway", queryresponse.data[0].Gateway);
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
        formData.append("hostid", searchValue);
        const jsonData = JSON.stringify(Object.fromEntries(formData));
        console.log("Json Data: " + jsonData);
        try {
            const response = await axios.put('http://localhost:8081/api/v1/inventory/networkconfig/update', jsonData);
            console.log(response.data);
            if (response.status === 200) {
                alert("Updated Network Config");
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
                <FormButton primary fluid width={2} type='submit' name="button">Search Network Config</FormButton>
            </Form>
        </Segment>
        <Segment padded="very">
            <Form onSubmit={handleSubmit(handleUpdateSubmit)}>

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

                <FormButton primary fluid width={2} type='submit'>Submit</FormButton>
            </Form>
            <br></br>
        </Segment>
    </>
    );
}


