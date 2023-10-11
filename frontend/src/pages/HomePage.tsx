import axios from "axios";
import { useEffect, useMemo, useState } from "react";
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
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [clockedIn, setClockedIn] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [timeStart, setTimeStart] = useState<number>(0);
  var interval: NodeJS.Timeout;

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
          timeSpent: presentTime(task.timeSpent),
        })
    );
    setTasks(newTasks);
  };

  // Converts time from milliseconds to hours, minutes and seconds
  const convertTime = (milliseconds: number) => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    return { hours, minutes, seconds };
  };

  // Presents time in string format of HH:MM:SS
  const presentTime = (milliseconds: number) => {
    const { hours, minutes, seconds } = convertTime(milliseconds);
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

    const { data } = await axios.post("http://[::1]:3000/task", form, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (data.status === 404 || data.status === 400) {
      console.error(data.response);
    } else {
      console.log(data);
      // Refresh the page after adding in new task
      window.location.reload();
    }
  };

  // Handles Task Deletion
  const handleDelete = async (e: React.SyntheticEvent, id: string) => {
    e.preventDefault();

    const { data } = await axios.delete(`http://[::1]:3000/task/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (data.status === 404 || data.status === 400) {
      console.error(data.response);
    } else {
      // Refresh the page after deleting a task
      window.location.reload();
    }
  };

  // Handles clocking in and out
  const handleClockIn = async (
    e: React.SyntheticEvent,
    id: string,
    time: string
  ) => {
    e.preventDefault();
    console.log(`http://[::1]:3000/task/${clockedIn ? "clockOut" : "clockin"}`);

    const { data } = await axios.patch(
      `http://[::1]:3000/task/${clockedIn ? "clockOut" : "clockIn"}/${id}`,
      { time: time },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );

    if (data.status === 404 || data.status === 400) {
      console.error(data.response);
    } else {
      if (clockedIn) {
        // About to clock  out
        setTimer(0);
        setTimeStart(0);
        clearInterval(interval);
        window.location.reload();
      } else {
        // About to clock in
        setTimeStart(Date.now());
        console.log("Clocking in!");
        interval = setInterval(() => {
          setTimer((timer) => timer + 1000);
        }, 1000);
      }
      setClockedIn(!clockedIn);
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
                <b>Time Spent on Task:</b>
                {task.timeSpent}
              </Row>
              <Row style={{ paddingTop: 5 }}>
                <Button
                  type="button"
                  className="btn-space"
                  style={{ width: 100, marginLeft: 188 }}
                  onClick={async (e) => {
                    await handleClockIn(e, task.id, timer.toString());
                  }}
                >
                  {clockedIn ? "Clock Out" : "Clock In"}
                </Button>
                {presentTime(timer)}
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
                  onClick={async (e) => {
                    await handleDelete(e, task.id);
                  }}
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
        onClick={() => setOpenCreate(!openCreate)}
      >
        Create New Task
      </Button>
      <div style={{ width: 500 }}>
        <Collapse
          in={openCreate}
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
