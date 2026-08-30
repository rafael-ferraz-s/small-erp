"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const demoAccounts = [
  {
    label: "Admin",
    email: "admin@tenant.local",
    password: "tenant123",
    role: "admin",
    description: "Visão operacional do tenant",
  },
  {
    label: "Super admin",
    email: "superadmin@tenant.local",
    password: "super123",
    role: "super_admin",
    description: "Visão consolidada do grupo",
  },
  {
    label: "General admin",
    email: "general@tenant.local",
    password: "general123",
    role: "general_admin",
    description: "Controle global da plataforma",
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>(demoAccounts[0].email);
  const [password, setPassword] = useState<string>(demoAccounts[0].password);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as { error?: string; redirectTo?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Falha ao autenticar.");
      }

      router.push(payload.redirectTo ?? "/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível entrar no sistema.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[1.05fr_1.2fr]">
        <section className="bg-slate-950 px-8 py-10 text-slate-100 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 font-semibold text-white">
              SE
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Small ERP</p>
              <p className="text-lg font-semibold">Tenant Control</p>
            </div>
          </div>

          <div className="mt-10 space-y-7">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Plataforma</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
                Gestão operacional do seu negócio
              </h1>
            </div>

            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                    setError("");
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-left transition hover:border-indigo-500 hover:bg-slate-900"
                >
                  <div>
                    <p className="text-base font-semibold text-white">{account.label}</p>
                    <p className="text-sm text-slate-400">{account.description}</p>
                  </div>
                  <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-200">
                    {account.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Acesso</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Entrar no ERP</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  placeholder="usuario@empresa.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Credenciais mock</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                {demoAccounts.map((account) => (
                  <div key={account.email} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
                    <div>
                      <p className="font-medium text-slate-900">{account.label}</p>
                      <p className="text-xs text-slate-500">{account.email}</p>
                    </div>
                    <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {account.password}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
