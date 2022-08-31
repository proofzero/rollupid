import {
    Outlet
  } from "@remix-run/react";

import Nav from "../nav/Nav";

import styles from "./layout.css";
import logo from "../../assets/three-id-logo.svg";


export const links = () => [
  { rel: "stylesheet", href: styles },
];

export default function Layout() {
  return (
      <div className="layout">
          <nav>
            <img src={logo} alt="threeid" />
          </nav>
          <div className="content flex-1">
            <Outlet />
          </div>
          <footer>
            <p>
              3ID is non-custodial and secure. We will never request access to your assets.
            </p>
          </footer>
      </div>
  )
}
