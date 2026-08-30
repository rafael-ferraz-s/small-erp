"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";

import { ActionModal, RowActionButtons, type ActionField } from "@/components/erp-actions";
import { ErpShell } from "@/components/erp-shell";
import type { SessionUser } from "@/lib/mock-data";
import { getTenantStorageKey, usePersistentList } from "@/lib/mock-persistence";
import { companyRows as seedCompanyRows, type CompanyRow } from "@/lib/mock-erp";
import { useSessionUser } from "@/lib/session-user";

function CompaniesClient({ user }: { user: SessionUser }) {
  const { items: companyList, setItems: setCompanyList } = usePersistentList<CompanyRow>(
    getTenantStorageKey(user, "small-erp-companies"),
    seedCompanyRows,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyRow | null>(null);

  const fields: ActionField[] = [
    { key: "name", label: "Nome da empresa", placeholder: "Ex: Nova Loja do Vale" },
    { key: "segment", label: "Segmento", placeholder: "Ex: Varejo" },
    { key: "users", label: "Usuários", type: "number", placeholder: "12" },
    { key: "turnover", label: "Faturamento", placeholder: "R$ 180k" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Ativa", "Em onboarding", "Pendente"],
      defaultValue: "Pendente",
    },
  ];

  const initialValues = editingCompany
    ? {
        name: editingCompany.name,
        segment: editingCompany.segment,
        users: editingCompany.users,
        turnover: editingCompany.turnover,
        status: editingCompany.status,
      }
    : {
        name: "",
        segment: "",
        users: 0,
        turnover: "R$ 0,00",
        status: "Pendente",
      };

  const handleSave = (values: Record<string, string | number>) => {
    const nextCompany: CompanyRow = {
      name: String(values.name || "Nova empresa"),
      segment: String(values.segment || "Geral"),
      users: Number(values.users ?? 0),
      turnover: String(values.turnover || "R$ 0"),
      status: (String(values.status || "Pendente") as CompanyRow["status"]),
    };

    if (editingCompany) {
      setCompanyList((current) => current.map((item) => (item.name === editingCompany.name ? nextCompany : item)));
    } else {
      setCompanyList((current) => [nextCompany, ...current]);
    }

    setEditingCompany(null);
  };

  const handleDelete = (company: CompanyRow) => {
    setCompanyList((current) => current.filter((item) => item.name !== company.name));
  };

  return (
    <ErpShell user={user} title="Empresas" subtitle="Visão das operações por unidade ou plataforma">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Portfolio de empresas</h3>
          <button
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            onClick={() => {
              setEditingCompany(null);
              setModalOpen(true);
            }}
            type="button"
          >
            + Nova empresa
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Segmento</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Usuários</th>
                <th className="px-4 py-3 font-medium">Faturamento</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {companyList.map((company) => (
                <tr key={company.name} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{company.name}</td>
                  <td className="px-4 py-3 text-slate-600">{company.segment}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        company.status === "Ativa"
                          ? "bg-emerald-100 text-emerald-700"
                          : company.status === "Em onboarding"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {company.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{company.users}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{company.turnover}</td>
                  <td className="px-4 py-3">
                    <RowActionButtons
                      onDelete={() => handleDelete(company)}
                      onEdit={() => {
                        setEditingCompany(company);
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
        key={`${editingCompany?.name ?? "new"}-${modalOpen ? "open" : "closed"}`}
        description="Crie ou atualize uma empresa do portfolio no mock do ERP."
        fields={fields}
        initialValues={initialValues}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCompany(null);
        }}
        onSubmit={handleSave}
        submitLabel={editingCompany ? "Salvar empresa" : "Criar empresa"}
        title={editingCompany ? "Editar empresa" : "Nova empresa"}
      />
    </ErpShell>
  );
}

function CompaniesPage() {
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

  if (user.role !== "general_admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 text-slate-700">
        <p className="text-lg font-medium">Apenas o perfil general_admin possui acesso à tela de empresas.</p>
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

  return <CompaniesClient user={user} />;
}

export default dynamic(() => Promise.resolve(CompaniesPage), { ssr: false });
