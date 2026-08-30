"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";

import { ActionModal, RowActionButtons, type ActionField } from "@/components/erp-actions";
import { ErpShell } from "@/components/erp-shell";
import type { SessionUser } from "@/lib/mock-data";
import { getTenantStorageKey, usePersistentList } from "@/lib/mock-persistence";
import { useSessionUser } from "@/lib/session-user";

type OnboardingItem = {
  name: string;
  phase: string;
  status: "Em andamento" | "Pendente" | "Concluído";
  tone: "amber" | "rose" | "emerald";
};

const seedOnboarding: OnboardingItem[] = [
  { name: "Delícias do Norte", phase: "Dados básicos", status: "Em andamento", tone: "amber" },
  { name: "Distribuição Alfa", phase: "Integração contábil", status: "Pendente", tone: "rose" },
  { name: "Cafeteria Prime", phase: "Configuração final", status: "Concluído", tone: "emerald" },
];

function OnboardingClient({ user }: { user: SessionUser }) {
  const { items: onboardingRows, setItems: setOnboardingRows } =
    usePersistentList<OnboardingItem>(
      getTenantStorageKey(user, "small-erp-onboarding"),
      seedOnboarding,
    );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<OnboardingItem | null>(null);

  const fields: ActionField[] = [
    { key: "name", label: "Empresa", placeholder: "Ex: Nova empresa" },
    { key: "phase", label: "Fase", placeholder: "Ex: Dados básicos" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Em andamento", "Pendente", "Concluído"],
      defaultValue: "Pendente",
    },
  ];

  const initialValues = editingRow
    ? { name: editingRow.name, phase: editingRow.phase, status: editingRow.status }
    : { name: "", phase: "Dados básicos", status: "Pendente" };

  const handleSave = (values: Record<string, string | number>) => {
    const nextStatus = String(values.status || "Pendente") as OnboardingItem["status"];
    const tone: OnboardingItem["tone"] =
      nextStatus === "Concluído" ? "emerald" : nextStatus === "Pendente" ? "rose" : "amber";

    const nextItem: OnboardingItem = {
      name: String(values.name || "Empresa nova"),
      phase: String(values.phase || "Dados básicos"),
      status: nextStatus,
      tone,
    };

    if (editingRow) {
      setOnboardingRows((current) => current.map((item) => (item.name === editingRow.name ? nextItem : item)));
    } else {
      setOnboardingRows((current) => [nextItem, ...current]);
    }

    setEditingRow(null);
  };

  const handleDelete = (item: OnboardingItem) => {
    setOnboardingRows((current) => current.filter((row) => row.name !== item.name));
  };

  return (
    <ErpShell user={user} title="Onboarding" subtitle="Acompanhamento de novas empresas e migração inicial">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Status de implantação</h3>
          <button
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            onClick={() => {
              setEditingRow(null);
              setModalOpen(true);
            }}
            type="button"
          >
            Nova implementação
          </button>
        </div>

        <div className="space-y-3">
          {onboardingRows.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div>
                <p className="font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">{item.phase}</p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.tone === "amber"
                      ? "bg-amber-100 text-amber-700"
                      : item.tone === "rose"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {item.status}
                </span>
                <RowActionButtons
                  onDelete={() => handleDelete(item)}
                  onEdit={() => {
                    setEditingRow(item);
                    setModalOpen(true);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <ActionModal
        key={`${editingRow?.name ?? "new"}-${modalOpen ? "open" : "closed"}`}
        description="Cadastre ou atualize uma empresa em onboarding no mock do ERP."
        fields={fields}
        initialValues={initialValues}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSave}
        submitLabel={editingRow ? "Salvar etapa" : "Criar onboarding"}
        title={editingRow ? "Editar onboarding" : "Nova implementação"}
      />
    </ErpShell>
  );
}

function OnboardingPage() {
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

  return <OnboardingClient user={user} />;
}

export default dynamic(() => Promise.resolve(OnboardingPage), { ssr: false });
