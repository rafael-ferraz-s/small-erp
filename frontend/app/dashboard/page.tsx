import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ErpShell } from "@/components/erp-shell";
import { parseSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth-session";
import { getDashboardData } from "@/lib/mock-data";

function MetricCard({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "emerald" | "blue" | "amber" | "rose";
}) {
  const toneClass: Record<typeof tone, string> = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    blue: "bg-sky-50 text-sky-700 ring-sky-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ring-1 ${toneClass[tone]}`}>
          {delta}
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    redirect("/");
  }

  const sessionUser = parseSessionToken(sessionCookie);

  if (!sessionUser) {
    redirect("/");
  }

  const dashboard = getDashboardData(sessionUser.role, sessionUser.tenantName);

  return (
    <ErpShell
      user={sessionUser}
      title="Dashboard"
      subtitle={
        sessionUser.role === "general_admin"
          ? "Visão global da plataforma e controle de empresas"
          : sessionUser.role === "super_admin"
            ? "Consolidação operacional do grupo"
            : "Visão operacional do tenant"
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Vendas do período</h2>
              <p className="text-sm text-slate-500">Comparativo dos últimos 6 meses</p>
            </div>
          </div>

          <div className="mt-6 flex h-52 items-end gap-3">
            {dashboard.salesTrend.map((point) => (
              <div key={point.label} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-40 w-full items-end justify-center">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 to-sky-400"
                    style={{ height: `${Math.max(point.value * 3.2, 24)}px` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500">{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {sessionUser.role === "super_admin" ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Vendas por filial ativa</h2>
              <p className="text-sm text-slate-500">Total de vendas quebrado por loja ativa</p>
            </div>
          </div>

          <div className="mt-6 flex h-52 items-end gap-3">
            {dashboard.activeStoreSales.map((point) => (
              <div key={point.label} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-40 w-full items-end justify-center">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-sky-600 to-indigo-400"
                    style={{ height: `${Math.max(point.value * 3.2, 24)}px` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500">{point.label}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Vendas recentes</h2>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Pedido</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {dashboard.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{sale.id}</td>
                    <td className="px-4 py-3 text-slate-600">{sale.customer}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{sale.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        sale.status === "Paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : sale.status === "Pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Baixo estoque</h2>
          </div>

          <div className="space-y-3">
            {dashboard.lowStock.map((item) => (
              <div key={item.sku} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.sku} · Estoque {item.stock} / mínimo {item.minimum}</p>
                </div>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  item.status === "Low stock" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ErpShell>
  );
}
