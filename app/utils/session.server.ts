import { db } from "~/utils/db.server";
import bcrypt from "bcrypt";
import { createCookieSessionStorage, redirect } from "remix";
type LoginType = {
  username: string;
  password: string;
};

export async function register({ username, password }: LoginType) {
  let passwordHash = await bcrypt.hash(password, 10);
  let user = await db.user.create({
    data: {
      username,
      passwordHash,
    },
  });
  return user;
}

export async function login({ username, password }: LoginType) {
  let existingUser = await db.user.findFirst({ where: { username } });
  if (!existingUser) return null;
  let isCorrectPassword = await bcrypt.compare(
    password,
    existingUser.passwordHash
  );
  if (!isCorrectPassword) return null;
  return existingUser;
}

let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("Must set environment variable session secret");
}

let storage = createCookieSessionStorage({
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    name: "RJ_session",
    secrets: [sessionSecret],
  },
});

export async function createUserSession(userId: string, redirectTo: string) {
  let session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  let session = await getUserSession(request);
  let userId = session.get("userId");
  if (typeof userId !== "string") return null;
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  let userId = await getUserId(request);
  if (!userId) {
    let params = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${params}`);
  }
  return userId;
}

export async function getUser(request: Request) {
  let userId = await getUserId(request);
  if (!userId) return null;
  return db.user.findUnique({
    where: { id: userId },
  });
}

export async function logout(request: Request) {
  let session = await getUserSession(request);
  return redirect(`/jokes`, {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}
