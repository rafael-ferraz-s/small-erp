"use client";

import { useEffect, useState } from "react";

import type { SessionUser } from "@/lib/mock-data";

export function useSessionUser() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "same-origin",
          signal: controller.signal,
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const payload = (await response.json()) as { user?: SessionUser | null };
        setUser(payload.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setIsReady(true);
      }
    };

    loadSession();

    return () => {
      controller.abort();
    };
  }, []);

  return { user, isReady };
}
