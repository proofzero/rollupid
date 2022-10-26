import { getUserSession, destroyUserSession } from "~/utils/session.server";


//@ts-ignore
export async function action({ request }) {
    const session = await getUserSession(request)
    return await destroyUserSession(session)
  }