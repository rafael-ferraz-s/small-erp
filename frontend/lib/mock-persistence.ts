"use client";

import { useEffect, useState } from "react";

import type { SessionUser } from "@/lib/mock-data";

export const getTenantStorageKey = (
  user: Pick<SessionUser, "tenantCode" | "role">,
  key: string,
) => `${key}:${user.tenantCode}:${user.role}`;

export function usePersistentList<T>(storageKey: string, initialValue: T[]) {
  const [items, setItems] = useState<T[]>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return initialValue;
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, storageKey]);

  return { items, setItems };
}
