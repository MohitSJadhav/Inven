import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { InputAdornment, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CryptoJS from 'crypto-js';
// https://stackblitz.com/edit/cryptojs-aes-encrypt-decrypt-mosqnf?file=index.js

const defaultTheme = createTheme();

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    let navigate = useNavigate();

    useEffect(() => {
        // Get isLoggedIn from Session Storage
        let isLoggedIn = sessionStorage.getItem('isLoggedIn');

        // If isLoggedIn is true, redirect to /vm
        if (isLoggedIn === 'true') {
            navigate('/vm');
        }
    }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        if (isLoggedIn === "") {
            alert("User already logged in.")
            return
        }

        try {
            const queryresponse = await axios.get(`http://localhost:8081/api/v1/inventory/user/search?email=${email}`);
            console.log((queryresponse.data))
            if (queryresponse.status === 200) {
                console.log("check fields");
                console.log(queryresponse.data[0]);
                console.log(email);
                console.log(password);
                if (new String(queryresponse.data[0].email).valueOf() === new String(email).valueOf() && new String((CryptoJS.AES.decrypt(queryresponse.data[0].password, 'secret_key_here_lol').toString(CryptoJS.enc.Utf8))).valueOf() === new String(password).valueOf() && new String(queryresponse.data[0].status).valueOf() === new String("active").valueOf()) {
                    sessionStorage.setItem('isLoggedIn', true);
                    console.log("set  the fields");
                    if (queryresponse.data[0].groupname === "admin") {
                        sessionStorage.setItem('isAdmin', true);
                    }
                    sessionStorage.setItem('loggedUser', queryresponse.data[0].email);
                    console.log("set all the fields");
                    window.location.href = "/vm";
                }
                else {
                    alert("Either user is inactive or else check your email and password.");
                }
                console.log("fields");

            } else {
                console.error(queryresponse.status);

            }
        } catch (error) {
            if (error.response.status === 400) {
                alert("Invalid input!");
            }
            if (error.response.status === 500) {
                alert("Internal Server Error!");
            }
        }

    };

    const [showPassword, setShowPassword] = useState(false);
    const handleTogglePasswordVisibility = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = () => setShowPassword(!showPassword);

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        {/* Email address */}

                        <TextField
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={email}
                            helperText="Valid gmail id"
                            inputProps={{ pattern: "^[a-zA-Z.0-9]+@gmail.com$" }}
                            onChange={(event, data) => { setEmail(event.target.value) }}
                        />
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
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}