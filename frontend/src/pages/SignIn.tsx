import React from "react";
import { Button, Form } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  let navigate = useNavigate();
  return (
    <div>
      <h1>Welcome to Task Manager</h1>
      <Form
        onSubmit={async (e: React.SyntheticEvent) => {
          e.preventDefault();
          const target = e.target as typeof e.target & {
            email: { value: string };
            password: { value: string };
          };
          const form = {
            email: target.email.value,
            password: target.password.value,
          };

          const { data } = await axios.post("http://[::1]:3000/signin", form);
          if (data.status === 404) {
            console.log(data.response);
          } else {
            localStorage.setItem("token", data);
            console.log(localStorage.getItem("token"));
            navigate("/tasks");
          }
        }}
      >
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            autoFocus
            autoComplete="email"
            required
          />
          <Form.Text className="text-muted"></Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            autoFocus
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Log In
        </Button>
      </Form>
    </div>
  );
};

export default SignIn;
