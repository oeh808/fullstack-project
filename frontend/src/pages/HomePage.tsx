import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionHeader,
  Alert,
  Button,
  ButtonGroup,
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
  priority: string;
  dueDate: Date;
}

/* Components to be added:
  - A search bar
  - A timer
  - A table of tasks
*/
function HomePage() {
  let navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);

  const [titleFilter, setTitleFilter] = useState<string>("");
  const [statusesFilter, setStatusesFilter] = useState<string[]>([
    "OPEN",
    "IN_PROGRESS",
    "DONE",
  ]);
  const [prioritiesFilter, setPrioritiesFilter] = useState<string[]>([
    "HIGH",
    "MEDIUM",
    "LOW",
  ]);
  const [dueDateFilter, setDueDatesFilter] = useState<Date>();
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);

  const [openStatusFilter, setOpenStatusFilter] = useState<boolean>(false);
  const [openPrioritiesFilter, setOpenPrioritesFilter] =
    useState<boolean>(false);
  const [openDueDateFilter, setOpenDueDateFilter] = useState<boolean>(false);

  const [clockedIn, setClockedIn] = useState<boolean>(false);
  const [clockedInId, setClockedInId] = useState<string>("-1");
  const [timer, setTimer] = useState<number>(0);
  const [intervalId, setIntervalId] =
    useState<ReturnType<typeof setInterval>>();

  const updateOpenStatusFilter = (status: string) => {
    const index = statusesFilter.findIndex((element) => element == status);
    const newStatusFilter = statusesFilter;

    if (index == -1) {
      // Status is not in the filter array and should be added
      newStatusFilter.push(status);
    } else {
      // Status exists in the filter array and should be removed
      newStatusFilter.splice(index, 1);
    }

    setStatusesFilter(newStatusFilter);
  };

  const updateOpenPrioritesFilter = (status: string) => {
    const index = prioritiesFilter.findIndex((element) => element == status);
    const newPrioritiesFilter = prioritiesFilter;

    if (index == -1) {
      // Status is not in the filter array and should be added
      newPrioritiesFilter.push(status);
    } else {
      // Status exists in the filter array and should be removed
      newPrioritiesFilter.splice(index, 1);
    }

    setPrioritiesFilter(newPrioritiesFilter);
  };

  // Handles searching for tasks
  const getTasks = async () => {
    const { data } = await axios.post(
      "http://[::1]:3000/task/search",
      {
        title: titleFilter,
        statuses: statusesFilter,
        priorities: prioritiesFilter,
        dueDate: dueDateFilter,
      },
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
        priority: string;
        dueDate: Date;
      }) =>
        newTasks.push({
          id: task.id,
          title: task.title,
          status: task.status,
          timeSpent: presentTime(task.timeSpent),
          priority: task.priority,
          dueDate: new Date(task.dueDate),
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
    singleTask.dueDate = new Date(singleTask.dueDate);
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
      formGroupPrio: { value: string };
      formGroupDueDate: { value: string };
    };
    const form = {
      title: target.formGroupTitle.value,
      priority: target.formGroupPrio.value,
      dueDate: target.formGroupDueDate.value,
    };

    const { data } = await axios.post("http://[::1]:3000/task", form, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (data.status === 404 || data.status === 400) {
      console.error(data.response);
      setErrorMessage("Task must have a title.");
    } else {
      console.log(data);
      const newTask: Task = data;
      newTask.dueDate = new Date(newTask.dueDate);
      const newTasks: Task[] = [...tasks];
      newTasks.push(newTask);
      setOpenCreate(false);
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
      formGroupPrio: { value: string };
      formGroupDueDate: { value: string };
    };

    if (!validTime(target.formGroupTime.value)) {
      setErrorMessage("Time needs to be of the format HH:MM:SS");
      return;
    }

    const form = {
      title: target.formGroupTitle.value,
      status: target.formGroupCompletedTask.checked == true ? "DONE" : "OPEN",
      timeSpent: convertTimeToMilliseconds(target.formGroupTime.value),
      priority: target.formGroupPrio.value,
      dueDate: target.formGroupDueDate.value,
    };

    if (!form.title) {
      setErrorMessage("Task must have a title.");
      return;
    }

    const { data } = await axios.patch(`http://[::1]:3000/task/${id}`, form, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (data.status === 404 || data.status === 400) {
      console.error(data.response);
    } else {
      setOpenUpdate(false);
      getSingleTask(id);
    }
  };

  // Checks if a given string is a valid HH:MM:SS
  const validTime = (time: string) => {
    const pattern = /^(?:[0-9][0-9]):[0-5][0-9]:[0-5][0-9]$/;
    return time.match(pattern);
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
      setErrorMessage(data.response.message);
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
        <h1>Home Page</h1>
        <Row>
          <Col xs={20}>
            <Form.Control
              placeholder="Search by Title..."
              onChange={(e) => setTitleFilter(e.target.value)}
            />
          </Col>
          <Col>
            <ButtonGroup aria-label="Basic example">
              <Button
                variant="info"
                style={{ marginRight: 2 }}
                onClick={() => setOpenStatusFilter(!openStatusFilter)}
              >
                Filter Statuses
              </Button>
              <Collapse
                in={openStatusFilter}
                className="rounded-lg border-top border-bottom border-info"
              >
                <Form>
                  <Form.Check
                    type="checkbox"
                    label="OPEN"
                    defaultChecked={
                      statusesFilter.find((element) => element == "OPEN")
                        ? true
                        : false
                    }
                    onChange={() => updateOpenStatusFilter("OPEN")}
                    style={{ marginRight: 5, fontSize: 13 }}
                  />
                  <Form.Check
                    type="checkbox"
                    label="IN_PROGRESS"
                    defaultChecked={
                      statusesFilter.find((element) => element == "IN_PROGRESS")
                        ? true
                        : false
                    }
                    onChange={() => updateOpenStatusFilter("IN_PROGRESS")}
                    style={{ marginRight: 5, fontSize: 13 }}
                  />
                  <Form.Check
                    type="checkbox"
                    label="DONE"
                    defaultChecked={
                      statusesFilter.find((element) => element == "DONE")
                        ? true
                        : false
                    }
                    onChange={() => updateOpenStatusFilter("DONE")}
                    style={{ marginRight: 5, fontSize: 13 }}
                  />
                </Form>
              </Collapse>
              <Button
                variant="info"
                style={{ marginRight: 2 }}
                onClick={() => setOpenPrioritesFilter(!openPrioritiesFilter)}
              >
                Filter Priorities
              </Button>
              <Collapse
                in={openPrioritiesFilter}
                className="rounded-lg border-top border-bottom border-info"
              >
                <Form>
                  <Form.Check
                    type="checkbox"
                    label="HIGH"
                    defaultChecked={
                      prioritiesFilter.find((element) => element == "HIGH")
                        ? true
                        : false
                    }
                    onChange={() => updateOpenPrioritesFilter("HIGH")}
                    style={{ marginRight: 5, fontSize: 13 }}
                  />
                  <Form.Check
                    type="checkbox"
                    label="MEDIUM"
                    defaultChecked={
                      prioritiesFilter.find((element) => element == "MEDIUM")
                        ? true
                        : false
                    }
                    onChange={() => updateOpenPrioritesFilter("MEDIUM")}
                    style={{ marginRight: 5, fontSize: 13 }}
                  />
                  <Form.Check
                    type="checkbox"
                    label="LOW"
                    defaultChecked={
                      prioritiesFilter.find((element) => element == "LOW")
                        ? true
                        : false
                    }
                    onChange={() => updateOpenPrioritesFilter("LOW")}
                    style={{ marginRight: 5, fontSize: 13 }}
                  />
                </Form>
              </Collapse>
              <Button
                variant="info"
                style={{ marginRight: 20 }}
                onClick={() => setOpenDueDateFilter(!openDueDateFilter)}
              >
                Filter Due Date
              </Button>
              <Collapse
                in={openDueDateFilter}
                className="rounded-lg border-top border-bottom border-info"
              >
                <Form>
                  <Form.Control
                    type="date"
                    onChange={(e) =>
                      setDueDatesFilter(new Date(e.target.value))
                    }
                  />
                </Form>
              </Collapse>
            </ButtonGroup>
            <Button type="submit" onClick={getTasks}>
              Search
            </Button>
          </Col>
        </Row>
      </header>
      <h2>Timer: {presentTime(timer)}</h2>
      {/* Displays an Alert if the current user has no tasks */}
      {tasks.length === 0 && <Alert variant="warning">You have no tasks</Alert>}
      <Accordion flush style={{ width: 500, marginLeft: 100 }}>
        {tasks.map((task) => (
          <Accordion.Item
            eventKey={task.id}
            onClick={() => setErrorMessage("")}
          >
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
              <Row className="square border-bottom">
                <b>Priority:</b>
                {task.priority}
              </Row>
              <Row className="square border-bottom">
                <b>Due Date:</b>
                {task.dueDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
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
                {errorMessage && (
                  <Alert variant="danger"> {errorMessage} </Alert>
                )}
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
                          defaultChecked={task.status == "DONE" ? true : false}
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
                        <Form.Group className="mb-3" controlId="formGroupPrio">
                          <Form.Label>Priority</Form.Label>
                          <Form.Select
                            defaultValue={task.priority}
                            style={{ backgroundColor: "#F2F3F4" }}
                          >
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group
                          className="mb-3"
                          controlId="formGroupDueDate"
                        >
                          <Form.Label>Due Date</Form.Label>
                          <Form.Control
                            defaultValue={
                              task.dueDate.getFullYear() +
                              "-" +
                              (task.dueDate.getMonth() + 1 < 10
                                ? "0" + (task.dueDate.getMonth() + 1)
                                : task.dueDate.getMonth() + 1) +
                              "-" +
                              (task.dueDate.getDate() < 10
                                ? "0" + task.dueDate.getDate()
                                : task.dueDate.getDate())
                            }
                            style={{ backgroundColor: "#F2F3F4" }}
                            placeholder="Enter date task is due"
                            type="date"
                          />
                        </Form.Group>
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
      <div style={{ width: 500, marginLeft: 100 }}>
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
              {errorMessage && <Alert variant="danger"> {errorMessage} </Alert>}
            </Form.Group>
            <Form.Group className="mb-3" controlId="formGroupPrio">
              <Form.Label>Priority</Form.Label>
              <Form.Select style={{ backgroundColor: "#85929E" }}>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formGroupDueDate">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                style={{ backgroundColor: "#85929E" }}
                placeholder="Enter date task is due"
                type="date"
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
