import { logout } from "~/utils/session.server";
import type { ActionFunction, LoaderFunction } from "remix";
import { redirect } from "remix";
export let action: ActionFunction = ({ request }) => logout(request);

export let loader: LoaderFunction = async () => {
  return redirect("/");
};
