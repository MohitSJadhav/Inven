import React, { useState } from "react";
import { Segment, FormField, Form, FormButton, Dropdown, FormDropdown, DropdownItem, FormSelect, FormTextArea } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { useForm } from "react-hook-form";
import Select from '@mui/material/Select';
import { FormControl, MenuItem, Input, InputLabel } from "@mui/material";

// vulnerabilityid VARCHAR(255) PRIMARY KEY,
// description VARCHAR(255),
// vulnerabilityname VARCHAR(255),
// detectiondate DATETIME,
// severity VARCHAR(255),
// status VARCHAR(255)

export default function AddCpu() {

    const { register, handleSubmit, formState: { errors } } = useForm()
    const [disktype, setdisktype] = useState("");
    const [size, setSize] = useState("");
    const [numofcores, setCores] = useState("");
    const [memory, setMemory] = useState("");
    const formFieldWidth = 4;

    const onSubmit = async (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        formData.append("disktype", disktype);
        formData.append("size", size);
        formData.append("numofcores", numofcores);
        formData.append("memory", memory);
        const jsonData = JSON.stringify(Object.fromEntries(formData));
        console.log("Json Data: " + jsonData);
        let response
        try {
            response = await axios.post('http://localhost:8081/api/v1/inventory/cpudiskmem/create', jsonData);
            console.log(response.data);
            if (response.status === 200) {
                alert("Added resources to Inventory for host with id: " + data["hostid"]);
            }
        } catch (error) {
            if (error.response.status === 400) {
                alert("Please check if all fields are valid. Maybe host with same id already exists");
            }
            if (error.response.status === 500) {
                alert("Internal error! Please try again");
            }
            else {
                console.log(error);
            }
        }
    };

    const handleDiskType = (e) => setdisktype(e.target.value)
    const handleSize = (e) => setSize(e.target.value)
    const handleCpu = (e) => setCores(e.target.value)
    const handleMemory = (e) => setMemory(e.target.value)


    return (
        <Segment padded="very">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormField width={formFieldWidth} required={true}>
                    <label>HostID</label>
                    <input
                        placeholder="also known as FQDN"
                        type='text'
                        {...register("hostid", { required: true })} // pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/ 
                    />
                    {errors.hostid && <p className="ui negative mini message">valid name required</p>}
                </FormField>

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

                <FormButton primary fluid width={2} type='submit'>Create Vulnerability</FormButton>
            </Form >
        </Segment >
    );
}