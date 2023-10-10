import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import ListGroup from "react-bootstrap/ListGroup";

/* Components to be added:
  - A search bar
  - A timer
  - A table of tasks
*/
function HomePage() {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [tasks, setTasks] = useState<string[]>([]);

  const getTasks = async () => {
    // console.log(localStorage.getItem("token"));
    const { data } = await axios.get("http://[::1]:3000/task", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    let newTasks: string[] = [];

    data.forEach((task: { title: string }) => newTasks.push(task.title));
    setTasks(newTasks);
  };

  // Runs only on first render (Doesn't do so in dev due to React.strictmode)
  useMemo(() => {
    getTasks().catch(console.error);
  }, []);

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
      {/* Displays an Alert if the current user has no tasks */}
      {tasks.length === 0 && <Alert variant="warning">You have no tasks</Alert>}
      <ListGroup>
        {tasks.map((task, index) => (
          <ListGroup.Item
            className={
              selectedIndex === index
                ? "list-group-item active"
                : "list-group-item"
            }
            key={task}
            onClick={() => {
              setSelectedIndex(index);
              // Implement a way to open up the task in an overlay
            }}
          >
            {task}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
}

export default HomePage;
