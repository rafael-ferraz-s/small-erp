"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";

import { ActionModal, RowActionButtons, type ActionField } from "@/components/erp-actions";
import { ErpShell } from "@/components/erp-shell";
import type { SessionUser } from "@/lib/mock-data";
import { getTenantStorageKey, usePersistentList } from "@/lib/mock-persistence";
import { userRows as seedUserRows, type UserRow } from "@/lib/mock-erp";
import { useSessionUser } from "@/lib/session-user";

function UsersClient({ user }: { user: SessionUser }) {
  const { items: userList, setItems: setUserList } = usePersistentList<UserRow>(
    getTenantStorageKey(user, "small-erp-users"),
    seedUserRows,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);

  const fields: ActionField[] = [
    { key: "name", label: "Nome", placeholder: "Ex: Carlos Reis" },
    { key: "email", label: "E-mail", placeholder: "carlos@empresa.com" },
    { key: "role", label: "Perfil", placeholder: "Financeiro" },
    { key: "lastLogin", label: "Último acesso", placeholder: "Hoje, 08:30" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Ativo", "Inativo"],
      defaultValue: "Ativo",
    },
  ];

  const initialValues = editingUser
    ? {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        lastLogin: editingUser.lastLogin,
        status: editingUser.status,
      }
    : {
        name: "",
        email: "",
        role: "Vendas",
        lastLogin: "Hoje",
        status: "Ativo",
      };

  const handleSave = (values: Record<string, string | number>) => {
    const nextUser: UserRow = {
      name: String(values.name || "Novo usuário"),
      email: String(values.email || "novo@empresa.com"),
      role: String(values.role || "Vendas"),
      lastLogin: String(values.lastLogin || "Hoje"),
      status: (String(values.status || "Ativo") as UserRow["status"]),
    };

    if (editingUser) {
      setUserList((current) => current.map((item) => (item.email === editingUser.email ? nextUser : item)));
    } else {
      setUserList((current) => [nextUser, ...current]);
    }

    setEditingUser(null);
  };

  const handleDelete = (userMember: UserRow) => {
    setUserList((current) => current.filter((item) => item.email !== userMember.email));
  };

  return (
    <ErpShell user={user} title="Usuários" subtitle="Gestão de acessos e papéis do sistema">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Equipe e permissões</h3>
          <button
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            onClick={() => {
              setEditingUser(null);
              setModalOpen(true);
            }}
            type="button"
          >
            + Novo usuário
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Último acesso</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {userList.map((member) => (
                <tr key={member.email} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{member.name}</td>
                  <td className="px-4 py-3 text-slate-600">{member.email}</td>
                  <td className="px-4 py-3 text-slate-600">{member.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        member.status === "Ativo" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{member.lastLogin}</td>
                  <td className="px-4 py-3">
                    <RowActionButtons
                      onDelete={() => handleDelete(member)}
                      onEdit={() => {
                        setEditingUser(member);
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
        key={`${editingUser?.email ?? "new"}-${modalOpen ? "open" : "closed"}`}
        description="Adicione ou edite um usuário do sistema no mock do ERP."
        fields={fields}
        initialValues={initialValues}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleSave}
        submitLabel={editingUser ? "Salvar usuário" : "Criar usuário"}
        title={editingUser ? "Editar usuário" : "Novo usuário"}
      />
    </ErpShell>
  );
}

function UsersPage() {
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

  return <UsersClient user={user} />;
}

export default dynamic(() => Promise.resolve(UsersPage), { ssr: false });
