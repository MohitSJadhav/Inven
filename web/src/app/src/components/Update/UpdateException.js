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
// import SemanticDatepicker from "react-semantic-ui-datepickers";

export default function UpdateException() {
    const tagOptions = [
        {
            key: 'exception_id',
            text: 'Exception ID',
            value: 'exception_id',
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

    const handleDate = (event) => { setDateValue(dayjs(event.target.value)); }

    const onSubmit = async (event) => {
        event.preventDefault();
        console.log("search value " + searchFilterValue);

        if (searchValue === "" || searchFilterValue === "") {
            alert('Missing search value. Try searching again!');
        } else {
            try {
                const queryresponse = await axios.get(`http://vm12mj-2lply.us-dal11.compute.cssp.tzla.net:8081/api/v1/inventory/vms/exception/search?value=${searchValue.toLowerCase()}&filterby=${searchFilterValue.toLowerCase()}`);
                if (queryresponse.status === 200) {
                    // console.log(typeof JSON.stringify(queryresponse.data));
                    console.log((JSON.stringify(queryresponse.data)));
                    setResponseData(JSON.parse(JSON.stringify(queryresponse)));
                    // setValue("exception_id", queryresponse.data.data[0].hostname);
                    setValue("vmid_fk", queryresponse.data.data[0].vmid_fk);
                    setValue("reason", queryresponse.data.data[0].reason);
                    setValue("approved_by", queryresponse.data.data[0].approved_by);
                    setValue("exception_status", queryresponse.data.data[0].exception_status);
                    // setValue("expiry_date", );
                    setDateValue(dayjs(queryresponse.data.data[0].expiry_date));
                    setValue("exception_tag", queryresponse.data.data[0].exception_tag);
                    setValue("jira", queryresponse.data.data[0].jira);
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
        formData.append("exception_id", searchValue)
        const jsonData = JSON.stringify(Object.fromEntries(formData));
        console.log("Json Data: " + jsonData);
        try {
            const response = await axios.put('http://vm12mj-2lply.us-dal11.compute.cssp.tzla.net:8081/api/v1/inventory/vms/exception/update', jsonData);
            console.log(response.data);
            if (response.status === 200) {
                alert("Updated vm");
            }
        } catch (error) {
            console.error(error);
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
                        placeholder={"Enter Exception ID"}
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
                    <label>VM ID</label>
                    <input
                        placeholder="ex: 86eda8e8-b6e2-11ee-84f9-0242ac110003"
                        type='text'
                        {...register("vmid_fk", { required: true })}
                    />
                    {errors.vmid_fk && <p className="ui negative mini message">VM id required</p>}
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
                        placeholder="user@gmail.com"
                        type='text'
                        {...register("approved_by", { required: true, pattern: /\w+@gmail\.com*/ })}
                    />
                    {errors.approved_by && <p className="ui negative mini message">approvers required and separated by comma with no spaces in between</p>}
                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Exception Status</label>
                    <input
                        placeholder="pending,denied,approved"
                        type='text'
                        {...register("exception_status", { required: true, pattern: /^(?:pending|denied|approved)$/ })}
                    />
                    {errors.exception_status && <p className="ui negative mini message">status of exception (either 'pending', 'denied' or 'approved') required</p>}
                </FormField>

                {/* <FormField width={formFieldWidth} required={false}>
                    <label>Expiry Date</label>
                    <input
                        placeholder="MM-DD-YYYY HH:MM:SS"
                        type='text'
                        {...register("expiry_date", { required: false })}
                    />
                    {errors.expiry_date && <p className="ui negative mini message">check for errors</p>}
                </FormField> */}


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
                            onChange={(date) => setDateValue(date)}
                            sx={{ width: '25%' }}
                        />
                    </DemoContainer>
                </LocalizationProvider>
                <br></br>

                {/* <AppWithBasic /> */}
                {/* <SemanticDatepicker></SemanticDatepicker> */}

                <FormField width={formFieldWidth} required={false}>
                    <label>Jira Tasks</label>
                    <input
                        placeholder="JIRA-1233"
                        type='text'
                        {...register("jira", { required: false })}
                    />
                    {errors.jira && <p className="ui negative mini message">check for errors</p>}
                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Exception Tag</label>
                    <input
                        placeholder="vm/appcode"
                        type='text'
                        {...register("exception_tag", { required: true, pattern: /^(?:appcode|vm)$/ })}
                    />
                    {errors.exception_tag && <p className="ui negative mini message">Either 'vm' or 'appcode' tag value required</p>}
                </FormField>

                <FormButton primary fluid width={2} type='submit'>Submit</FormButton>
            </Form>
            <br></br>
        </Segment>
    </>
    );
}

// const AppWithBasic = () => {
//     const [currentDate, setNewDate] = useState(new Date());
//     function onChange(event, data) {
//         setNewDate(data.value);
//         console.log((new Date(data.value)).toLocaleDateString());
//     }

//     return <SemanticDatepicker onChange={onChange} format="YYYY-MM-DD" />;
// };

