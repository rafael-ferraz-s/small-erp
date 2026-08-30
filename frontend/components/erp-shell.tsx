"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import type { SessionUser } from "@/lib/mock-data";

const navByRole: Record<SessionUser["role"], { label: string; href: string }[]> = {
  admin: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pedidos", href: "/orders" },
    { label: "Produtos", href: "/products" },
    { label: "Estoque", href: "/stock" },
    { label: "Financeiro", href: "/finance" },
    { label: "Usuários", href: "/users" },
    { label: "Empresa", href: "/company" },
  ],
  super_admin: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Filiais", href: "/branches" },
    { label: "Pedidos", href: "/orders" },
    { label: "Produtos", href: "/products" },
    { label: "Financeiro", href: "/finance" },
    { label: "Usuários", href: "/users" },
    { label: "Configurações", href: "/company" },
  ],
  general_admin: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Empresas", href: "/companies" },
    { label: "Usuários", href: "/users" },
    { label: "Onboarding", href: "/onboarding" },
    { label: "Relatórios", href: "/reports" },
    { label: "Configurações", href: "/company" },
  ],
};

export function ErpShell({
  user,
  title,
  subtitle,
  children,
}: {
  user: SessionUser;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = navByRole[user.role];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-slate-200 bg-slate-950 text-slate-100 lg:flex">
          <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 font-semibold text-white">
              SE
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Small ERP</p>
              <p className="text-sm font-semibold">
                {user.role === "general_admin"
                  ? "General Admin"
                  : user.role === "super_admin"
                    ? "Super Admin"
                    : "Tenant Admin"}
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Contexto</p>
            <div className="mt-3 rounded-xl bg-slate-800 p-3">
              <p className="text-sm font-semibold text-white">{user.tenantName}</p>
              <p className="text-xs text-slate-400">{user.tenantCode}</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 lg:pl-72">
          <header className="fixed left-0 right-0 top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm lg:left-72">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-slate-500">ERP</p>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-800">{user.name}</span>
                  <span className="ml-2 text-slate-500">{user.role}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Sair
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-6 pt-28">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-sm font-medium text-indigo-600">Visão operacional</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">{subtitle}</h2>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
