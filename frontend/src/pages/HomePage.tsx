import React from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import ListGroup from "react-bootstrap/ListGroup";

/* Components to be added:
  - A search bar
  - A timer
  - A table of tasks
*/
function HomePage() {
  return (
    <>
      <Form className="fixed-top">
        <h1>Home Page</h1>
        <Row className="align-items-center mx-0">
          <Col xs={10} className="mx-0">
            <Form.Control placeholder="Search by Title..." />
          </Col>
          <Col className="px-0">
            <Button>Search</Button>
          </Col>
        </Row>
      </Form>
      <ListGroup>
        <ListGroup.Item>Task 1</ListGroup.Item>
        <ListGroup.Item>Task 2</ListGroup.Item>
        <ListGroup.Item>Task 3</ListGroup.Item>
        <ListGroup.Item>Task 4</ListGroup.Item>
      </ListGroup>
    </>
  );
}

export default HomePage;
