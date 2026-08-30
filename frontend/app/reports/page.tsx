import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ErpShell } from "@/components/erp-shell";
import { parseSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth-session";

export default async function ReportsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    redirect("/");
  }

  const user = parseSessionToken(sessionCookie);

  if (!user) {
    redirect("/");
  }

  return (
    <ErpShell user={user} title="Relatórios" subtitle="Indicadores de plataforma e consolidação de desempenho">
      <section className="grid gap-6 xl:grid-cols-3">
        {[
          { label: "Receita total", value: "R$ 1,28M", tone: "emerald" },
          { label: "Empresas ativas", value: "18", tone: "blue" },
          { label: "Tickets em aberto", value: "9", tone: "amber" },
        ].map((report) => (
          <div key={report.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{report.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{report.value}</p>
            <div className={`mt-4 h-2 w-full rounded-full ${
              report.tone === "emerald" ? "bg-emerald-100" : report.tone === "blue" ? "bg-sky-100" : "bg-amber-100"
            }`}>
              <div className={`h-2 rounded-full ${
                report.tone === "emerald" ? "w-3/4 bg-emerald-500" : report.tone === "blue" ? "w-2/3 bg-sky-500" : "w-1/2 bg-amber-500"
              }`} />
            </div>
          </div>
        ))}
      </section>
    </ErpShell>
  );
}
