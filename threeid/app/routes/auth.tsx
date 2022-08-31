import {
    Outlet,
  } from "@remix-run/react";

import Layout, { links as layoutLinks } from "../components/layout/Layout";

export const links = () => [
    ...layoutLinks(),
];

export default function Auth() {
    return (
        <>
            {/* @ts-ignore */}
            <Layout />
        </>
    )
}