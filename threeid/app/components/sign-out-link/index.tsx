import { useSubmit } from "@remix-run/react";

export default function SignOut({className} : {className: string}) {
    let submit = useSubmit();

    return (
        <a className={className}
            style={{cursor: "pointer"}}
            onClick={() =>
                submit(null, { method: "post", action: `/auth/signout/` })
            }
            >
            Sign Out
        </a>
    )
}