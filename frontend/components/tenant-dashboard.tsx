import type { DashboardData, SessionUser } from "@/lib/mock-data";

type TenantDashboardProps = {
  user: SessionUser;
  dashboard: DashboardData;
};

function MetricCard({
  label,
  value,
  delta,
  tone,
  action,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "emerald" | "blue" | "amber" | "rose";
  action: string;
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
      <button className="mt-5 text-sm font-medium text-slate-700 hover:text-slate-950" type="button">
        {action}
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const toneMap: Record<string, string> = {
    Paid: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Overdue: "bg-rose-100 text-rose-700",
    "Low stock": "bg-amber-100 text-amber-700",
    "Out of stock": "bg-rose-100 text-rose-700",
    "Due this week": "bg-sky-100 text-sky-700",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneMap[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}

export function TenantDashboard({ user, dashboard }: TenantDashboardProps) {
  const roleLabelMap = {
    admin: "Admin",
    super_admin: "Super admin",
    general_admin: "General admin",
  } as const;

  const navItems =
    user.role === "general_admin"
      ? [
          "Dashboard",
          "Empresas",
          "Usuários",
          "Permissões",
          "Onboarding",
          "Relatórios",
          "Configurações",
        ]
      : [
          "Dashboard",
          "Pedidos",
          "Compras",
          "Fornecedores",
          "Produtos",
          "Categorias",
          "Estoque",
          "Movimentos",
          "Financeiro",
          "Usuários",
          "Empresa",
        ];

  const sectionLabel =
    user.role === "general_admin" ? "Visão da plataforma" : "Visão do tenant";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-slate-950 text-slate-100 lg:flex">
          <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 font-semibold text-white">
              SE
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Small ERP</p>
              <p className="text-sm font-semibold">
                {user.role === "general_admin" ? "General Admin" : "Tenant Admin"}
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-5">
            {navItems.map((item, index) => (
              <button
                key={item}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  index === 0
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                type="button"
              >
                <span>{item}</span>
              </button>
            ))}
          </nav>

          <div className="border-t border-slate-800 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {user.role === "general_admin" ? "Plataforma" : "Empresa"}
            </p>
            <div className="mt-3 rounded-xl bg-slate-800 p-3">
              <p className="text-sm font-semibold text-white">{dashboard.companyName}</p>
              <p className="text-xs text-slate-400">{user.tenantCode}</p>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Dashboard geral</p>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{sectionLabel}</h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-800">{user.name}</span>
                  <span className="ml-2 text-slate-500">{roleLabelMap[user.role]}</span>
                </div>
                <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700" type="button">
                  Sair
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-6">
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
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700" type="button">
                    Exportar
                  </button>
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

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Vendas recentes</h2>
                  <button className="text-sm font-medium text-slate-600 hover:text-slate-800" type="button">
                    Ver todas
                  </button>
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
                            <StatusBadge status={sale.status} />
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
                  <button className="text-sm font-medium text-slate-600 hover:text-slate-800" type="button">
                    Planejar compra
                  </button>
                </div>

                <div className="space-y-3">
                  {dashboard.lowStock.map((item) => (
                    <div key={item.sku} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div>
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.sku} · Estoque {item.stock} / mínimo {item.minimum}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Itens financeiros pendentes</h2>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700" type="button">
                  Gerar cobrança
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Cliente</th>
                      <th className="px-4 py-3 font-medium">Vencimento</th>
                      <th className="px-4 py-3 font-medium">Valor</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {dashboard.pendingFinancials.map((item) => (
                      <tr key={`${item.customer}-${item.amount}`} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{item.customer}</td>
                        <td className="px-4 py-3 text-slate-600">{item.due}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{item.amount}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
