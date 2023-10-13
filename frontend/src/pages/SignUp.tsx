import axios from "axios";
import { useEffect, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function SignUp() {
  let navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };
    const form = {
      email: target.email.value,
      password: target.password.value,
    };

    const { data } = await axios.post("http://[::1]:3000/signup", form);
    if (data.status === 400) {
      setErrorMessage(data.response.message);
    } else {
      setErrorMessage("");
      localStorage.setItem("token", data);
      console.log(localStorage.getItem("token"));
      navigate("/tasks");
    }
  };

  useEffect(() => {
    // Redirects user to home page if signed in
    if (localStorage.getItem("token")) {
      navigate("/tasks");
    }
  }, []);

  return (
    <div>
      <h1>Welcome to Task Tracker</h1>
      <h2>Sign up Page</h2>
      <Form onSubmit={handleSubmit}>
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
        {errorMessage && <Alert variant="danger"> {errorMessage} </Alert>}
        <Button variant="primary" type="submit">
          Register
        </Button>
      </Form>
    </div>
  );
}

export default SignUp;
