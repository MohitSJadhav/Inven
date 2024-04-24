import React, { useState } from "react";
import { Segment, FormField, Form, FormButton, Dropdown, FormDropdown, DropdownItem, FormSelect, FormTextArea } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import axios from 'axios';
import { useForm } from "react-hook-form";
import Select from '@mui/material/Select';
import { FormControl, MenuItem, InputLabel } from "@mui/material";
import TextField from "@mui/material/TextField";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { InputAdornment, IconButton } from '@mui/material';
import CryptoJS from "crypto-js";

export default function AddUser() {

    const { register, handleSubmit, formState: { errors } } = useForm()
    const [status, setStatus] = useState("");
    const [groupname, setGroup] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const handleTogglePasswordVisibility = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = () => setShowPassword(!showPassword);

    const formFieldWidth = 4;
    const onSubmit = async (data) => {

        let pass = CryptoJS.AES.encrypt(password, 'secret_key_here_lol').toString()
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        formData.append("groupname", groupname);
        formData.append("status", status);
        formData.append("password", pass);
        const jsonData = JSON.stringify(Object.fromEntries(formData));
        console.log("Json Data: " + jsonData);
        let response
        try {
            response = await axios.post('http://localhost:8081/api/v1/inventory/user/create', jsonData);
            console.log(response.data);
            if (response.status === 200) {
                alert("Created user");
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

    const handleGroupname = (e) => setGroup(e.target.value)
    const handleStatus = (e) => setStatus(e.target.value)


    return (
        <Segment padded="very">
            <Form onSubmit={handleSubmit(onSubmit)}>
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
                            <MenuItem value={"admin"}>Admin</MenuItem>
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
                            <MenuItem value={"active"}>Active</MenuItem>
                            <MenuItem value={"inactive"}>InActive</MenuItem>
                        </Select>
                    </FormControl>
                    <br></br>
                    <br></br>
                </div>


                <TextField
                    required

                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    inputProps={{ pattern: "^(?=.*[@#$])(.{8,})$" }} // Allow alphanumeric characters and spaces only
                    helperText="Must be at least 8 characters long containing atleast one out of @ ,# and $ symbol."
                    onChange={(event, data) => { setPassword(event.target.value) }}
                    autoComplete="new-password"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleTogglePasswordVisibility}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <FormButton primary fluid width={2} type='submit'>Create User</FormButton>
            </Form >
        </Segment >
    );
}