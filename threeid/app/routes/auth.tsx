import {
    Outlet,
  } from "@remix-run/react";

import styles from "../styles/auth.css";
import logo from "../assets/three-id-logo.svg";


export function links() {
    return [{ rel: "stylesheet", href: styles }];
}

export default function Auth() {
    return (
        <div className="wrapper grid grid-cols-3 gap-4">
          <nav className="col-span-3">
            <img src={logo} alt="threeid" />
          </nav>
          <article className="content col-span-3">
            <Outlet />
          </article>
          <footer className="col-span-3">
            <p>
              3ID is non-custodial and secure. We will never request access to your assets.
            </p>
          </footer>
      </div>
    )
}