import { cookies } from "next/headers";

const SESSION_COOKIE = "firsthour_session";
const SESSION_SECRET = "authenticated";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === SESSION_SECRET;
}

export async function authenticate(username: string, password: string): Promise<boolean> {
  const validUsername = process.env.ADMIN_USER || "admin";
  const validPassword = process.env.ADMIN_PASSWORD || "admin";

  if (username === validUsername && password === validPassword) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, SESSION_SECRET, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return true;
  }

  return false;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
