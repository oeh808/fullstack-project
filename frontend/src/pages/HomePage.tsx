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
import { useNavigate } from "react-router-dom";

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
  let navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState<string>("");
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [clockedIn, setClockedIn] = useState<boolean>(false);
  const [clockedInId, setClockedInId] = useState<string>("-1");
  const [timer, setTimer] = useState<number>(0);
  const [intervalId, setIntervalId] =
    useState<ReturnType<typeof setInterval>>();

  // Handles searcing for tasks
  const getTasks = async () => {
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

  const getSingleTask = async (id: string) => {
    const { data } = await axios.get(`http://[::1]:3000/task/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    const singleTask: Task = data;
    singleTask.timeSpent = presentTime(parseInt(singleTask.timeSpent));
    const index = tasks.findIndex((element) => element.id == singleTask.id);

    let newTasks: Task[] = [...tasks];

    newTasks[index] = singleTask;

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

  // Converts time from the HH:MM:SS format to milliseconds
  const convertTimeToMilliseconds = (time: string) => {
    const temp = time.split(":");
    const hours = parseInt(temp[0]);
    const minutes = parseInt(temp[1]) + hours * 60;
    const seconds = parseInt(temp[2]) + minutes * 60;

    return seconds * 1000;
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
      formGroupTitle: { value: string };
    };
    const form = {
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
      const newTask: Task = data;
      const newTasks: Task[] = [...tasks];
      newTasks.push(newTask);
      setTasks(newTasks);
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
      getTasks();
    }
  };

  // Handle Task Updating
  const handleUpdate = async (e: React.SyntheticEvent, id: string) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      formGroupTitle: { value: string };
      formGroupCompletedTask: { checked: boolean };
      formGroupTime: { value: string };
    };

    console.log(target.formGroupCompletedTask.checked);

    const form = {
      title: target.formGroupTitle.value,
      status: target.formGroupCompletedTask.checked == true ? "DONE" : "OPEN",
      timeSpent: convertTimeToMilliseconds(target.formGroupTime.value),
    };

    const { data } = await axios.patch(`http://[::1]:3000/task/${id}`, form, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (data.status === 404 || data.status === 400) {
      console.error(data.response);
    } else {
      getSingleTask(id);
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
        clearInterval(intervalId);
      } else {
        // About to clock in
        console.log("Clocking in!");
        setIntervalId(
          setInterval(() => {
            setTimer((timer) => timer + 1000);
          }, 1000)
        );
      }
      setClockedIn(!clockedIn);
      setClockedInId(id);
      getSingleTask(id);
    }
  };

  const handleSignOut = async (e: React.SyntheticEvent) => {
    e.preventDefault;
    localStorage.removeItem("token");

    navigate("/");
  };

  // Runs only on first render (Doesn't do so in dev due to React.strictmode)
  useMemo(() => {
    getTasks().catch(console.error);
  }, []);

  useEffect(() => {
    // Redirects user to sign in page if not logged in
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, []);

  return (
    <>
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
      <h2>Timer: {presentTime(timer)}</h2>
      {/* Displays an Alert if the current user has no tasks */}
      {tasks.length === 0 && <Alert variant="warning">You have no tasks</Alert>}
      <Accordion flush style={{ width: 500 }}>
        {tasks.map((task) => (
          <Accordion.Item eventKey={task.id}>
            <AccordionHeader>
              <b>{task.title}</b>
            </AccordionHeader>
            <AccordionBody>
              <Row className="square border-bottom">
                <b>Status:</b>
                {task.status}
              </Row>
              <Row className="square border-bottom">
                <b>Total Time Spent on Task:</b>
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
                  {clockedIn && clockedInId == task.id
                    ? "Clock Out"
                    : "Clock In"}
                </Button>
                <Button
                  type="button"
                  className="btn-space"
                  variant="info"
                  style={{ width: 100, marginLeft: 188 }}
                  onClick={() => setOpenUpdate(!openUpdate)}
                >
                  Edit Task
                </Button>
                <div style={{ width: 500 }}>
                  <Collapse
                    in={openUpdate}
                    className="rounded-lg border-top border-bottom border-info"
                  >
                    <Form
                      style={{ backgroundColor: "#E5E7E9" }}
                      onSubmit={async (e) => {
                        await handleUpdate(e, task.id);
                      }}
                    >
                      <Form.Group className="mb-3" controlId="formGroupTitle">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          style={{ backgroundColor: "#F2F3F4" }}
                          placeholder="Enter Title"
                          defaultValue={task.title}
                        />
                      </Form.Group>
                      <Form.Group
                        className="mb-3"
                        controlId="formGroupCompletedTask"
                      >
                        <Form.Check
                          type="checkbox"
                          label="Task Finished"
                          style={{ marginRight: 350, fontSize: 13 }}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="formGroupTime">
                        <Form.Label>Total Time Spent on Task</Form.Label>
                        <Form.Control
                          style={{ backgroundColor: "#F2F3F4" }}
                          placeholder="Enter Title"
                          defaultValue={task.timeSpent}
                        />
                      </Form.Group>
                      <Button variant="info" type="submit">
                        Update
                      </Button>
                    </Form>
                  </Collapse>
                </div>
                <Button
                  type="button"
                  className="btn-space"
                  variant="danger"
                  style={{ width: 100, marginLeft: 188, marginTop: 5 }}
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
          <Form onSubmit={handleCreate} style={{ backgroundColor: "#2C3E50" }}>
            <Form.Group className="mb-3" controlId="formGroupTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                style={{ backgroundColor: "#85929E" }}
                placeholder="Enter Title"
              />
            </Form.Group>
            <Button variant="success" type="submit">
              Create
            </Button>
          </Form>
        </Collapse>
      </div>
      <Form onSubmit={handleSignOut}>
        <Button variant="light" style={{ marginLeft: 400 }} type="submit">
          Sign Out
        </Button>
      </Form>
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
