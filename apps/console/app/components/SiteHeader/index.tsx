/**
 * @file app/shared/components/SiteHeader/index.tsx
 */

import { Form } from "@remix-run/react";

// TODO display user's 3iD avatar.
import avatar from "~/images/avatar.png";

// KubeltHeader
// -----------------------------------------------------------------------------

type KubeltHeaderProps = {
  // The wallet address of the logged-in user.
  wallet: string;
};

export default function KubeltHeader({ wallet }: KubeltHeaderProps) {
  return (
    <header className="flex items-center justify-between shadow-xl p-4 bg-white text-slate-500">
      <div className="text-left">
        <p>{wallet}</p>
      </div>
      <Form action="/logout" method="post">
        <button
          type="submit"
          className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
        >
          Logout
        </button>
        <img className="inline-block pl-6" src={avatar} />
      </Form>
    </header>
  );
};
