"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { ActionModal, type ActionField } from "@/components/erp-actions";
import { ErpShell } from "@/components/erp-shell";
import { getCompanySettings, saveCompanySettings } from "@/lib/company-settings";
import type { SessionUser } from "@/lib/mock-data";
import { useSessionUser } from "@/lib/session-user";

function CompanySettingsClient({ user }: { user: SessionUser }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [companyData, setCompanyData] = useState(() =>
    getCompanySettings(user.tenantName, user.tenantCode),
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      saveCompanySettings(user.tenantCode, companyData);
    }
  }, [companyData, user.tenantCode]);

  const fields: ActionField[] = [
    { key: "tenantName", label: "Razão social", placeholder: "Nome da empresa" },
    { key: "cnpj", label: "CNPJ", placeholder: "12.345.678/0001-90" },
    { key: "city", label: "Cidade", placeholder: "João Pessoa" },
    { key: "plan", label: "Plano", placeholder: "ERP Pro" },
    { key: "currency", label: "Moeda padrão", placeholder: "BRL" },
    { key: "timezone", label: "Hora local", placeholder: "UTC-3" },
  ];

  return (
    <ErpShell user={user} title="Configuração" subtitle="Dados da empresa e parâmetros operacionais">
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Dados da empresa</h3>
            <button
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
              onClick={() => setModalOpen(true)}
              type="button"
            >
              Salvar ajustes
            </button>
          </div>

          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <dt className="text-slate-500">Razão social</dt>
              <dd className="font-medium text-slate-800">{companyData.tenantName}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <dt className="text-slate-500">CNPJ</dt>
              <dd className="font-medium text-slate-800">{companyData.cnpj}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <dt className="text-slate-500">Cidade</dt>
              <dd className="font-medium text-slate-800">{companyData.city}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Plano</dt>
              <dd className="font-medium text-slate-800">{companyData.plan}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Parâmetros</h3>
          <div className="mt-5 space-y-3">
            {[
              { label: "Moeda padrão", value: companyData.currency },
              { label: "Zona fiscal", value: "Brasil" },
              { label: "Hora local", value: companyData.timezone },
              { label: "Expedição de documentos", value: "Ativa" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-600">{item.label}</span>
                <span className="font-medium text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ActionModal
        key={`${user.tenantCode}-${modalOpen ? "open" : "closed"}`}
        description="Atualize os dados cadastrais da empresa no mock do ERP."
        fields={fields}
        initialValues={companyData}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(values) => {
          setCompanyData((current) => ({
            ...current,
            ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)])),
          }));
          return true;
        }}
        submitLabel="Salvar alterações"
        title="Editar empresa"
      />
    </ErpShell>
  );
}

function CompanyPage() {
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

  return <CompanySettingsClient user={user} />;
}

export default dynamic(() => Promise.resolve(CompanyPage), { ssr: false });
