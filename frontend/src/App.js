// import React, { Component }  from 'react';
// import './App.css';
// import Button from 'react-bootstrap/Button'
// import Form from 'react-bootstrap/Form'
// import 'bootstrap/dist/css/bootstrap.min.css'
// import Alert from 'react-bootstrap/Alert'
// import Breadcrumb from 'react-bootstrap/Breadcrumb'
// import Container from 'react-bootstrap/Container'

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//       <p className='col-xs-12 h1 mb-0 font-weight-bold'>Log in</p>
//       &nbsp;

//       <Container fluid className='w-25'>
//       <Form>
//         <Form.Group className="mb-3" controlId="formEmail">
//           <Form.Label>Email address</Form.Label>
//           <Form.Control type="email" placeholder="name@example.com" />
//         </Form.Group>
//         <Form.Group className="mb-3" controlId="formPassword">
//           <Form.Label>Password</Form.Label>
//           <Form.Control type="password" placeholder="" />
//         </Form.Group>
//         <Button type='submit'>Submit</Button>
//       </Form>
//       </Container>
        
//       {/* <Breadcrumb variant='success'>
//         <Breadcrumb.Item>Test 1</Breadcrumb.Item>
//         <Breadcrumb.Item>Test 2</Breadcrumb.Item>
//         <Breadcrumb.Item active>Test 3</Breadcrumb.Item>
//       </Breadcrumb>

//       <Alert variant='danger'>This is a button</Alert>

//       <Button>Test Button</Button> */}
//       </header>
//     </div>
//   );
// }

// export default App;

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Tasks from "./pages/tasks";
import NoPage from "./pages/Nopage";
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page the website opens to */}
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
