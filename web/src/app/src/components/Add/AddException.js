import React, { useState } from "react";
import { Segment, FormField, Form, FormButton, Dropdown, FormDropdown, DropdownItem, FormSelect, FormTextArea } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { useForm } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import Select from '@mui/material/Select';
import { FormControl, MenuItem, Input, InputLabel } from "@mui/material";
import moment from "moment";
import { Controller } from "react-hook-form";

export default function AddException() {

    const { register, handleSubmit, control, getValues, formState: { errors } } = useForm()
    const [dateValue, setDateValue] = useState("");
    const [exception_status, setExceptionStatus] = useState("");
    const [exception_tag, setExceptionTag] = useState("");
    const formFieldWidth = 4;

    const onSubmit = async (data) => {
        if (dateValue === "") {
            alert("Exception expiry date required!")
            return
        }
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        formData.append("exception_tag", exception_tag);
        formData.append("exception_status", exception_status);
        formData.append("expiry_date", moment(new Date(dateValue).toLocaleString()).format("YYYY-MM-DD"));
        const jsonData = JSON.stringify(Object.fromEntries(formData));
        console.log("Json Data: " + jsonData);
        console.log(new Date(dateValue).toISOString())
        try {
            const response = await axios.post('http://vm12mj-2lply.us-dal11.compute.cssp.tzla.net:8081/api/v1/inventory/vms/exception/create', jsonData);
            console.log(response.data);
            if (response.status === 200) {
                alert("Added exception to VM: " + data["vmid_fk"]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleExceptionStatus = (e) => { setExceptionStatus(e.target.value) }
    const handleExceptionTag = (e) => setExceptionTag(e.target.value)
    const handleDate = (e) => setDateValue(e)

    return (
        <Segment padded="very">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormField width={formFieldWidth} required={true}>
                    <label>VM ID</label>
                    <input
                        placeholder="ex: 86eda8e8-b6e2-11ee-84f9-0242ac110003"
                        type='text'
                        {...register("vmid_fk", { required: true })} // pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/ 
                    />
                    {errors.vmid_fk && <p className="ui negative mini message">valid VM Id required</p>}
                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Reason</label>
                    <input
                        placeholder="The reason for pending/approved/denied is..."
                        type='text'
                        {...register("reason", { required: true })}
                    />
                    {errors.reason && <p className="ui negative mini message">required</p>}
                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Approvers</label>
                    <input
                        placeholder="DL-LXSRE@tesla.com,DL-LXSRE@tesla.com"
                        type='text'
                        {...register("approved_by", { required: true, pattern: /\w+@tesla\.com(,*\s*\w+@tesla\.com)*/ })}
                    />
                    {errors.approved_by && <p className="ui negative mini message">approvers required and separated by comma with no spaces in between</p>}
                </FormField>

                <div>
                    <FormControl variant="standard" sx={{ m: 1, width: "25%" }}>
                        <InputLabel id="exception_Status_input_label">Exception Status</InputLabel>
                        <Select
                            labelId="Exception_Status"
                            required={true}
                            slotProps={{
                                textField: {
                                    required: true,
                                },
                            }}
                            value={exception_status}
                            onChange={handleExceptionStatus}
                            label="Exception"

                        >
                            <MenuItem value={"pending"}>Pending</MenuItem>
                            <MenuItem value={"approved"}>Approved</MenuItem>
                            <MenuItem value={"denied"}>Denied</MenuItem>
                        </Select>
                    </FormControl>
                    <br></br>
                </div>


                <div>
                    <FormControl variant="standard" sx={{ m: 1, width: "25%" }}>
                        <InputLabel id="exception_tag_input_label">Exception Tag</InputLabel>
                        <Select
                            labelId="Exception_Tag"
                            required={true}
                            slotProps={{
                                textField: {
                                    required: true,
                                },
                            }}
                            value={exception_tag}
                            onChange={handleExceptionTag}
                            label="Exception Tag"
                        >
                            <MenuItem value={"vm"}>VM</MenuItem>
                            <MenuItem value={"appcode"}>AppCode</MenuItem>
                        </Select>
                    </FormControl>
                    <br></br>
                    <br></br>
                </div>

                <FormField width={formFieldWidth} required={false}>
                    <label>Jira Tasks</label>
                    <input
                        placeholder="JIRA-1234"
                        type='text'
                        {...register("jira", { required: false })}
                    />
                    {errors.jira && <p className="ui negative mini message">jira required</p>}
                </FormField>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateTimeField']}>
                        <DatePicker
                            slotProps={{
                                textField: {
                                    required: true,
                                },
                            }}
                            format="YYYY/DD/MM"
                            label="Expiry Date"
                            value={dateValue}
                            onChange={handleDate}
                            sx={{ width: '25%' }}
                        />
                    </DemoContainer>
                </LocalizationProvider>
                <br></br>

                <FormButton primary fluid width={2} type='submit'>Create</FormButton>
            </Form >
        </Segment >
    );
}