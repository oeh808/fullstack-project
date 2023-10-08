import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

// Signin Page
const SignIn = () => {
    return (
        <div className="App">
            <header className="App-header">
            <p className='col-xs-12 h1 mb-0 font-weight-bold'>Log in</p>
            &nbsp;
    
            <Container fluid className='w-25'>
            <Form>
            <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="name@example.com" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="" />
            </Form.Group>
            <Link to="/tasks">
                <Button type='submit'>Submit</Button>
            </Link>
            </Form>
            </Container>
            
            {/* <Breadcrumb variant='success'>
            <Breadcrumb.Item>Test 1</Breadcrumb.Item>
            <Breadcrumb.Item>Test 2</Breadcrumb.Item>
            <Breadcrumb.Item active>Test 3</Breadcrumb.Item>
            </Breadcrumb>
    
            <Alert variant='danger'>This is a button</Alert>
    
            <Button>Test Button</Button> */}
            </header>
        </div>
    );
  };
  
  export default SignIn;