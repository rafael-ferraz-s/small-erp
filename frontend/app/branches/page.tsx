"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ActionModal, RowActionButtons, type ActionField } from "@/components/erp-actions";
import { ErpShell } from "@/components/erp-shell";
import { getCompanyCurrency } from "@/lib/company-settings";
import type { SessionUser } from "@/lib/mock-data";
import { getTenantStorageKey, usePersistentList } from "@/lib/mock-persistence";
import { branchRows as seedBranchRows, formatCurrencyValue, generateEntityId, parseCurrencyValue, type BranchRow } from "@/lib/mock-erp";
import { useSessionUser } from "@/lib/session-user";

function BranchesClient({ user }: { user: SessionUser }) {
  const { items: branchList, setItems: setBranchList } = usePersistentList<BranchRow>(
    getTenantStorageKey(user, "small-erp-branches"),
    seedBranchRows,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchRow | null>(null);

  const fields: ActionField[] = [
    { key: "name", label: "Filial", placeholder: "Ex: Filial Sul" },
    { key: "city", label: "Cidade", placeholder: "Ex: Recife" },
    { key: "manager", label: "Gerente", placeholder: "Ex: Paula Ribeiro" },
    { key: "totalSales", label: "Vendas totais", type: "number", placeholder: "45000", min: 0, step: 0.01 },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Ativa", "Em implantação", "Pausada"],
      defaultValue: "Ativa",
    },
  ];

  const initialValues = editingBranch
    ? {
        name: editingBranch.name,
        city: editingBranch.city,
        manager: editingBranch.manager,
        totalSales: Number(parseCurrencyValue(editingBranch.totalSales)),
        status: editingBranch.status,
      }
    : {
        name: "",
        city: "",
        manager: "",
        totalSales: 0,
        status: "Ativa",
      };

  const handleSave = (values: Record<string, string | number>) => {
    const nextBranch: BranchRow = {
      id: editingBranch ? editingBranch.id : generateEntityId("FIL"),
      name: String(values.name || "Nova filial"),
      city: String(values.city || "Cidade"),
      manager: String(values.manager || "Gerente"),
      totalSales: formatCurrencyValue(
        Number(values.totalSales ?? 0),
        getCompanyCurrency(user.tenantCode),
      ),
      status: (String(values.status || "Ativa") as BranchRow["status"]),
    };

    if (editingBranch) {
      setBranchList((current) => current.map((item) => (item.id === editingBranch.id ? nextBranch : item)));
    } else {
      setBranchList((current) => [nextBranch, ...current]);
    }

    setEditingBranch(null);
  };

  const handleDelete = (branch: BranchRow) => {
    setBranchList((current) => current.filter((item) => item.id !== branch.id));
  };

  return (
    <ErpShell user={user} title="Filiais" subtitle="Gestão das lojas ativas e implantação de novas unidades">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Cadastro de filiais</h3>
          <button
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            onClick={() => {
              setEditingBranch(null);
              setModalOpen(true);
            }}
            type="button"
          >
            + Nova filial
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Filial</th>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 font-medium">Gerente</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Vendas totais</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {branchList.map((branch) => (
                <tr key={branch.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{branch.id}</td>
                  <td className="px-4 py-3 text-slate-600">{branch.name}</td>
                  <td className="px-4 py-3 text-slate-600">{branch.city}</td>
                  <td className="px-4 py-3 text-slate-600">{branch.manager}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        branch.status === "Ativa"
                          ? "bg-emerald-100 text-emerald-700"
                          : branch.status === "Em implantação"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {branch.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{branch.totalSales}</td>
                  <td className="px-4 py-3">
                    <RowActionButtons
                      onDelete={() => handleDelete(branch)}
                      onEdit={() => {
                        setEditingBranch(branch);
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
        key={`${editingBranch?.id ?? "new"}-${modalOpen ? "open" : "closed"}`}
        description="Cadastre ou atualize filiais para consolidar as vendas por loja."
        fields={fields}
        initialValues={initialValues}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBranch(null);
        }}
        onSubmit={handleSave}
        submitLabel={editingBranch ? "Salvar filial" : "Criar filial"}
        title={editingBranch ? "Editar filial" : "Nova filial"}
      />
    </ErpShell>
  );
}

function BranchesPage() {
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

  if (user.role !== "super_admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 text-slate-700">
        <p className="text-lg font-medium">Apenas o perfil super_admin possui acesso às filiais.</p>
        <button
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          onClick={() => router.push("/dashboard")}
          type="button"
        >
          Voltar ao dashboard
        </button>
      </div>
    );
  }

  return <BranchesClient user={user} />;
}

export default dynamic(() => Promise.resolve(BranchesPage), { ssr: false });
