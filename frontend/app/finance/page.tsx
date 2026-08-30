"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";

import { ActionModal, RowActionButtons, type ActionField } from "@/components/erp-actions";
import { ErpShell } from "@/components/erp-shell";
import { getCompanyCurrency } from "@/lib/company-settings";
import type { SessionUser } from "@/lib/mock-data";
import { getTenantStorageKey, usePersistentList } from "@/lib/mock-persistence";
import { financialRows as seedFinancialRows, formatCurrencyValue, parseCurrencyValue, type FinanceRow } from "@/lib/mock-erp";
import { useSessionUser } from "@/lib/session-user";

function FinanceClient({ user }: { user: SessionUser }) {
  const { items: financialRows, setItems: setFinancialRows } = usePersistentList<FinanceRow>(
    getTenantStorageKey(user, "small-erp-finance"),
    seedFinancialRows,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<FinanceRow | null>(null);

  const fields: ActionField[] = [
    { key: "customer", label: "Cliente", placeholder: "Ex: Mercado Novo" },
    { key: "due", label: "Vencimento", placeholder: "4 dias" },
    { key: "amount", label: "Valor", type: "number", placeholder: "2500", step: 0.01, min: 0 },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Pago", "Pendente", "Em atraso"],
      defaultValue: "Pendente",
    },
  ];

  const initialValues = editingRow
    ? {
        customer: editingRow.customer,
        due: editingRow.due,
        amount: Number(parseCurrencyValue(editingRow.amount)),
        status: editingRow.status,
      }
    : {
        customer: "",
        due: "4 dias",
        amount: 0,
        status: "Pendente",
      };

  const handleSave = (values: Record<string, string | number>) => {
    const nextRow: FinanceRow = {
      customer: String(values.customer || "Cliente novo"),
      due: String(values.due || "4 dias"),
      amount: formatCurrencyValue(
        Number(values.amount ?? 0),
        getCompanyCurrency(user.tenantCode),
      ),
      status: (String(values.status || "Pendente") as FinanceRow["status"]),
    };

    if (editingRow) {
      setFinancialRows((current) =>
        current.map((item) =>
          item.customer === editingRow.customer && item.amount === editingRow.amount ? nextRow : item,
        ),
      );
    } else {
      setFinancialRows((current) => [nextRow, ...current]);
    }

    setEditingRow(null);
  };

  const handleDelete = (row: FinanceRow) => {
    setFinancialRows((current) =>
      current.filter(
        (item) => !(item.customer === row.customer && item.amount === row.amount && item.due === row.due),
      ),
    );
  };

  return (
    <ErpShell user={user} title="Financeiro" subtitle="Contas a receber, pagamentos e cobrança">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Fluxo financeiro</h3>
          <button
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            onClick={() => {
              setEditingRow(null);
              setModalOpen(true);
            }}
            type="button"
          >
            Gerar cobrança
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Vencimento</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {financialRows.map((item) => (
                <tr key={`${item.customer}-${item.amount}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.customer}</td>
                  <td className="px-4 py-3 text-slate-600">{item.due}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{item.amount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.status === "Pago"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.status === "Pendente"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RowActionButtons
                      onDelete={() => handleDelete(item)}
                      onEdit={() => {
                        setEditingRow(item);
                        setModalOpen(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ActionModal
        key={`${editingRow?.customer ?? "new"}-${modalOpen ? "open" : "closed"}`}
        description="Crie ou atualize um registro financeiro do mock do ERP."
        fields={fields}
        initialValues={initialValues}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSave}
        submitLabel={editingRow ? "Salvar cobrança" : "Criar cobrança"}
        title={editingRow ? "Editar cobrança" : "Gerar cobrança"}
      />
    </ErpShell>
  );
}

function FinancePage() {
  const router = useRouter();
  const { user, isReady } = useSessionUser();

  if (!isReady) {
    return <div className="min-h-screen bg-slate-100" />;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 text-slate-700">
        <p className="text-lg font-medium">Acesso restrito. Faça login para continuar.</p>
        <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={() => router.push("/")} type="button">
          Voltar ao login
        </button>
      </div>
    );
  }

  return <FinanceClient user={user} />;
}

export default dynamic(() => Promise.resolve(FinancePage), { ssr: false });
