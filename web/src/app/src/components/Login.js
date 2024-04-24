import React, { useState } from "react";
import PropTypes from "prop-types";
import "./Login.css";
import 'semantic-ui-css/semantic.min.css';


import { Button, Form, Grid, Header, Segment } from 'semantic-ui-react'

export default function LoginPage({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();


    if (email === "" || password === "") {
      alert("Empty email/username or password")
    } else {
      if (email === "whoisadmin" && password === "a4bf96f73ec04730890580f64b38f2a8") {
        setToken("DummyToken");
      } else {
        alert("Invalid username or password");
      }
    }
  };
  return (
    <Grid textAlign='center' style={{ height: '60vh' }} verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as='h2' color='black' textAlign='center'>
          Log-in to your account
        </Header>
        <Segment >
          <Form size='large'>
            <Form.Input fluid icon='user' iconPosition='left' placeholder='E-mail/Username' onChange={(e, data) => { setEmail(data.value) }} />
            <Form.Input fluid icon='lock' iconPosition='left' placeholder='Password' type='password' onChange={(e, data) => { setPassword(data.value) }} />
            <Button primary fluid size='medium' onClick={handleSubmit}>Login</Button>
            <br></br>
            <Button secondary fluid size='medium' onClick={handleSubmit}>Login with Tesla Account</Button>

          </Form>
        </Segment>
      </Grid.Column>
    </Grid >
  );
}

LoginPage.propTypes = {
  setToken: PropTypes.func.isRequired
};