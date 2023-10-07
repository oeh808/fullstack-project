import React from "react";
import { Outlet, Link } from "react-router-dom";

const Layout = () => {
    {/* Series of links in the main page*/}
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </>
  )
};

export default Layout;