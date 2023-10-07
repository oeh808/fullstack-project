import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, Form, Button, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";


const Tasks = () => {
    return (
        <div className="App">
            <header className="App-header">
            <Container fluid className='w-25'>
                <h1 className="text-center fixed-top">Tasks Page</h1>
                <InputGroup className="mb-3">
                    
                    <Form.Control
                    placeholder="Enter Title..."
                    aria-label="Title Search"
                    aria-describedby="basic-addon1"
                    />
                    <Button>Search</Button>
                </InputGroup>
            </Container>
            <Link to={'/'}>
                <Button className="fixed-bottom">Sign Out</Button>
            </Link>
            </header>
        </div>
    )
}

export default Tasks;