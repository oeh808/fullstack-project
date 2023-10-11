import axios from "axios";
import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionHeader,
  Alert,
  Button,
  Col,
  Collapse,
  Form,
  Row,
} from "react-bootstrap";
import AccordionBody from "react-bootstrap/esm/AccordionBody";

interface Task {
  id: string;
  title: string;
  status: string;
  timeSpent: string;
}

/* Components to be added:
  - A search bar
  - A timer
  - A table of tasks
*/
function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState<string>("");
  const [open, setOpen] = useState(false);

  // Handles searcing for tasks
  const getTasks = async () => {
    // console.log(localStorage.getItem("token"));
    // console.log(title);
    const { data } = await axios.post(
      "http://[::1]:3000/task/search",
      { title: title },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    // console.log(data);

    let newTasks: Task[] = [];

    data.forEach(
      (task: {
        id: string;
        title: string;
        status: string;
        timeSpent: number;
      }) =>
        newTasks.push({
          id: task.id,
          title: task.title,
          status: task.status,
          timeSpent: convertTime(task.timeSpent),
        })
    );
    setTasks(newTasks);
  };

  // Converts time from milliseconds to HH:MM:SS format
  const convertTime = (milliseconds: number) => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    return (
      hours.toString().padStart(2, "0") +
      ":" +
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0")
    );
  };

  // Handles Task Creation
  const handleCreate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      formGroupId: { value: string };
      formGroupTitle: { value: string };
    };
    const form = {
      id: parseInt(target.formGroupId.value),
      title: target.formGroupTitle.value,
    };

    console.log(form);

    const { data } = await axios
      .post("http://[::1]:3000/task", form, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .catch();

    if (data.status === 404 || data.status === 400) {
      console.error(data.response);
    } else {
      console.log(data);
      // Refresh the page after adding in new task
      window.location.reload();
    }
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
              <Button
                type="button"
                onClick={getTasks}
                variant="info"
                style={{ marginRight: 20 }}
              >
                Search
              </Button>
            </Col>
          </Row>
        </Form>
      </header>
      {/* Displays an Alert if the current user has no tasks */}
      {tasks.length === 0 && <Alert variant="warning">You have no tasks</Alert>}
      <Accordion flush style={{ width: 500 }}>
        {tasks.map((task) => (
          <Accordion.Item eventKey={task.id}>
            <AccordionHeader>
              <b>{task.id}</b> : {task.title}
            </AccordionHeader>
            <AccordionBody>
              <Row className="square border-bottom">
                <b>Status:</b>
                {task.status}
              </Row>
              <Row className="square border-bottom">
                <b>Time Spent:</b>
                {task.timeSpent}
              </Row>
              <Row style={{ paddingTop: 5 }}>
                <Button
                  type="button"
                  className="btn-space"
                  style={{ width: 100, marginLeft: 188 }}
                >
                  Clock In
                </Button>
                <Button
                  type="button"
                  className="btn-space"
                  style={{ width: 100, marginLeft: 188 }}
                >
                  Update
                </Button>
                <Button
                  type="button"
                  className="btn-space"
                  variant="danger"
                  style={{ width: 100, marginLeft: 188 }}
                >
                  Delete
                </Button>
              </Row>
            </AccordionBody>
          </Accordion.Item>
        ))}
      </Accordion>
      <Button
        type="button"
        className="btn-space"
        variant="success"
        style={{ width: 150 }}
        onClick={() => setOpen(!open)}
      >
        Create New Task
      </Button>
      <div style={{ width: 500 }}>
        <Collapse
          in={open}
          className="rounded-lg border-top border-bottom border-success"
        >
          <Form onSubmit={handleCreate}>
            <Form.Group className="mb-3" controlId="formGroupId">
              <Form.Label>Task ID</Form.Label>
              <Form.Control placeholder="Enter Unique ID" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formGroupTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control placeholder="Enter Title" />
            </Form.Group>
            <Button variant="success" type="submit">
              Create
            </Button>
          </Form>
        </Collapse>
      </div>
    </>
  );
}

export default HomePage;

{
  /* <ListGroup>
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
      </ListGroup> */
}
