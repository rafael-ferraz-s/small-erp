import { NextResponse } from "next/server";

import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth-session";
import { mockAccounts } from "@/lib/mock-data";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-mail e senha são obrigatórios." },
      { status: 400 },
    );
  }

  const account = mockAccounts[email];

  if (!account || account.password !== password) {
    return NextResponse.json(
      { error: "Credenciais inválidas. Use as contas de demonstração." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    user: account.user,
    redirectTo: "/dashboard",
  });

  response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(account.user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
