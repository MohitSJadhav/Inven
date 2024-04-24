import React, { useState } from "react";
import { Segment, FormField, Form, FormButton } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { useForm } from "react-hook-form";
import Select from '@mui/material/Select';
import { FormControl, MenuItem, InputLabel } from "@mui/material";


export default function AddPackage() {

    const { register, handleSubmit, control, getValues, formState: { errors } } = useForm()
    const [permission, setVulStatus] = useState("");
    const formFieldWidth = 4;

    const onSubmit = async (data) => {

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        formData.append("permission", permission);
        const jsonData = JSON.stringify(Object.fromEntries(formData));
        console.log("Json Data: " + jsonData);
        try {
            const response = await axios.post('http://localhost:8081/api/v1/inventory/package/create', jsonData);
            console.log(response.data);
            if (response.status === 200) {
                alert("Added package");
            }
        } catch (error) {
            console.error(error);
            if (error.response.status == 400) {
                alert('Package already exists or please check fields data');
            } else {
                alert("Error adding the package!");
            }
        };
    }

    const handlePermission = (e) => setVulStatus(e.target.value)

    return (
        <Segment padded="very">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormField width={formFieldWidth} required={true}>
                    <label>Package Name</label>
                    <input
                        placeholder="MySQL"
                        type='text'
                        {...register("packagename", { required: true })} // pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/ 
                    />
                    {errors.packagename && <p className="ui negative mini message">valid name required</p>}
                </FormField>

                <FormField width={formFieldWidth} required={true}>
                    <label>Version</label>
                    <input
                        placeholder="1.0.0"
                        type='text'
                        {...register("version", { required: true })} // pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/ 
                    />
                    {errors.version && <p className="ui negative mini message">valid name required</p>}
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

                <FormButton primary fluid width={2} type='submit'>Create Package</FormButton>
            </Form >
        </Segment >
    );
}