import axios from "axios";
import { useMemo, useState } from "react";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import ListGroup from "react-bootstrap/ListGroup";

/* Components to be added:
  - A search bar
  - A timer
  - A table of tasks
*/
function HomePage() {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [tasks, setTasks] = useState<string[][]>([]);
  const [title, setTitle] = useState<string>("");

  const getTasks = async () => {
    console.log(localStorage.getItem("token"));
    console.log(title);
    const { data } = await axios.post(
      "http://[::1]:3000/task/search",
      { title: title },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    console.log(data);

    let newTasks: string[][] = [];

    data.forEach((task: { id: string; title: string }) =>
      newTasks.push([task.id, task.title])
    );
    setTasks(newTasks);
  };

  // Runs only on first render (Doesn't do so in dev due to React.strictmode)
  useMemo(() => {
    getTasks().catch(console.error);
  }, []);

  return (
    <>
      {/* <header className="position-absolute align-items top-0 start-5"> */}
      <header className="Home-header">
        <Form>
          <h1>Home Page</h1>
          <Row>
            <Col xs={20}>
              <Form.Control
                placeholder="Search by Title..."
                onChange={(e) => setTitle(e.target.value)}
              />
            </Col>
            <Col>
              <Button type="button" onClick={getTasks}>
                Search
              </Button>
            </Col>
          </Row>
        </Form>
      </header>
      {/* CRUD */}
      <Button type="button" className="btn-space" variant="success">
        Create
      </Button>
      <Button type="button" className="btn-space" variant="info">
        Update
      </Button>
      <Button type="button" className="btn-space" variant="danger">
        Delete
      </Button>
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
            key={task[0]}
            onClick={() => {
              setSelectedIndex(index);
              // Implement a way to open up the task in an overlay
            }}
          >
            {task[1]}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
}

export default HomePage;
