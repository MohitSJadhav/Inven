import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import { useState } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import signupLogo from '../components/signupLogo.jpg';
import { Select, FormControl, InputLabel, InputAdornment, IconButton } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CryptoJS from 'crypto-js';


// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function SignUp() {
    const [gender, setGender] = useState('Male');
    const [age, setAge] = useState("18");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("User");


    const handleSubmit = (event) => {
        event.preventDefault();
        // console.log(`Username: ${firstname} ${lastname}, Password: ${password}, Email: ${email} Gender: ${gender}  Age: ${age} UserType ${user}`);
        let users = JSON.parse(localStorage.getItem('userDetails')) || [];

        // Check if a user with the same email already exists
        if (users.some(user => user.email === email)) {
            alert('A user with this email already exists.');
            return;
        }

        const newUser = {
            firstName: firstname,
            lastName: lastname,
            email: email,
            gender: gender,
            age: age,
            role: role,
            password: CryptoJS.AES.encrypt(password, 'secret_key_here_lol').toString()
        };

        users.push(newUser);

        localStorage.setItem('userDetails', JSON.stringify(users));
        alert("User registered!");
    };

    const handleCancel = (event) => {
        event.preventDefault();
        setAge(18);

    }
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePasswordVisibility = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = () => setShowPassword(!showPassword);

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: `url(${signupLogo})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign up
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                            <Grid container spacing={2}>

                                {/* Firstname */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        autoComplete="given-name"
                                        name="firstName"
                                        required
                                        fullWidth
                                        id="firstName"
                                        label="First Name"
                                        autoFocus
                                        value={firstname}
                                        inputProps={{ pattern: "[a-zA-Z0-9]*" }} // Allow alphanumeric characters only
                                        onChange={(event, data) => { setFirstname(event.target.value) }}
                                    />
                                </Grid>

                                {/* Lastname */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="lastName"
                                        label="Last Name"
                                        name="lastName"
                                        autoComplete="family-name"
                                        inputProps={{ pattern: "[a-zA-Z0-9]*" }} // Allow alphanumeric characters only
                                        value={lastname}
                                        onChange={(event, data) => { setLastName(event.target.value) }}
                                    />
                                </Grid>

                                {/* Email address */}
                                <Grid item xs={12} >
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                        value={email}
                                        helperText="Valid hawk or gmail id"
                                        inputProps={{ pattern: "^[a-zA-Z.0-9]+@(hawk.iit.edu|gmail.com)$" }}
                                        onChange={(event, data) => { setEmail(event.target.value) }}
                                    />
                                </Grid>

                                {/* Gender */}
                                <Grid item xs={12} sm={4}>
                                    <Box display="flex" justifyContent="left" alignItems="center" height="100%">
                                        <FormControl sx={{ m: 1, minWidth: 100 }}>
                                            <InputLabel id="gender-select-autowidth-label">Gender</InputLabel>
                                            <Select
                                                labelId="gender-label"
                                                id="gender"
                                                name='gender'
                                                onChange={(event, data) => { setGender(event.target.value) }}
                                                label="Gender"
                                                fullWidth
                                                value={gender}
                                                required
                                            >
                                                <MenuItem value={"Male"}>Male</MenuItem>
                                                <MenuItem value={"Female"}>Female</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Grid>

                                {/* User Type */}
                                <Grid item xs={12} sm={4}>
                                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                        <FormControl sx={{ m: 1, minWidth: 100 }}>
                                            <InputLabel id="role-select-autowidth-label">Role</InputLabel>
                                            <Select
                                                labelId="role-label"
                                                id="role"
                                                name='role'
                                                value={role}
                                                onChange={(event, data) => { setRole(event.target.value) }}
                                                label="Role"
                                                fullWidth
                                                required
                                            >
                                                <MenuItem value={"User"}>User</MenuItem>
                                                <MenuItem value={"Event Provider"}>Event Provider</MenuItem>
                                                <MenuItem value={"System Admin"}>System Admin</MenuItem>
                                                <MenuItem value={"Content Moderator"}>Content Moderator</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Grid>

                                {/* Age */}
                                <Grid item xs={12} sm={4}>
                                    <Box display="flex" justifyContent="right" alignItems="center" height="100%">
                                        <FormControl sx={{ m: 1, minWidth: 100 }}>
                                            <InputLabel id="age-select-autowidth-label">Age</InputLabel>
                                            <Select
                                                labelId="age-label"
                                                id="age"
                                                value={age}
                                                label="Age"
                                                fullWidth
                                                onChange={(event, data) => { setAge(event.target.value) }}
                                                required
                                            >
                                                {[...Array(96).keys()].map((value) => {
                                                    value += 5;
                                                    return <MenuItem key={value} value={value}>{value}</MenuItem>
                                                })}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Grid>

                                {/* Password */}
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
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
                                </Grid>

                            </Grid>

                            {/* SignUp and Cancel Button */}
                            <Grid item xs={12} sm={6}>
                                <Button
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2, ml: 2, mr: 'auto' }}
                                >
                                    Sign Up
                                </Button>
                            </Grid>

                            <Grid container justifyContent="flex-end">
                                <Grid item sx={{ marginTop: "2px" }}>
                                    <Link href="/" variant="body2" >
                                        Already have an account? Sign in
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>

                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider >
    );
}