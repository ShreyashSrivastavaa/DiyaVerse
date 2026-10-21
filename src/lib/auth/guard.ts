import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "./session";
import { validateCsrfToken } from "./csrf";

export async function requireAdmin(): Promise<
  | { authorized: true; admin: { id: string; email: string; role: string } }
  | { authorized: false; response: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return {
    authorized: true,
    admin: session.admin,
  };
}

export async function requireMutationAdmin(req: NextRequest): Promise<
  | { authorized: true; admin: { id: string; email: string; role: string } }
  | { authorized: false; response: NextResponse }
> {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return auth;
  }

  // Validate CSRF token for mutations
  const csrfValid = await validateCsrfToken(req);
  if (!csrfValid) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      ),
    };
  }

  return auth;
}
