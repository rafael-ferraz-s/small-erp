import { createHmac, timingSafeEqual } from "crypto";

import type { SessionUser } from "@/lib/mock-data";

export const SESSION_COOKIE_NAME = "small_erp_session";

const SESSION_SECRET =
  process.env.SMALL_ERP_SESSION_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  "dev-only-small-erp-session-secret";

const toBase64Url = (value: string) =>
  Buffer.from(value, "utf8").toString("base64url");

const fromBase64Url = (value: string) =>
  Buffer.from(value, "base64url").toString("utf8");

const signValue = (value: string) =>
  createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");

const isValidRole = (
  role: unknown,
): role is SessionUser["role"] =>
  role === "admin" || role === "super_admin" || role === "general_admin";

const isValidSessionUser = (value: unknown): value is SessionUser => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SessionUser>;

  return Boolean(
    candidate.id &&
      candidate.name &&
      candidate.email &&
      candidate.tenantName &&
      candidate.tenantCode &&
      Array.isArray(candidate.permissions) &&
      isValidRole(candidate.role),
  );
};

export const createSessionToken = (user: SessionUser) => {
  const payload = toBase64Url(JSON.stringify(user));
  const signature = signValue(payload);
  return `${payload}.${signature}`;
};

export const parseSessionToken = (token: string): SessionUser | null => {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signValue(payload);
  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(payload));
    return isValidSessionUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
