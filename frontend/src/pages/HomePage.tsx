import React from "react";
import ListGroup from "react-bootstrap/ListGroup";

/* Components to be added:
  - A search bar
  - A timer
  - A table of tasks
*/
function HomePage() {
  return (
    <>
      <h1 className="fixed-top">Home Page</h1>
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
