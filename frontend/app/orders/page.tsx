"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";

import { ActionModal, RowActionButtons, type ActionField } from "@/components/erp-actions";
import { ErpShell } from "@/components/erp-shell";
import { getCompanyCurrency } from "@/lib/company-settings";
import type { SessionUser } from "@/lib/mock-data";
import { getTenantStorageKey, usePersistentList } from "@/lib/mock-persistence";
import { formatCurrencyValue, generateEntityId, parseCurrencyValue, orders as seedOrders, type Order } from "@/lib/mock-erp";
import { useSessionUser } from "@/lib/session-user";

function OrdersClient({ user }: { user: SessionUser }) {
  const { items: orderRows, setItems: setOrderRows } = usePersistentList<Order>(
    getTenantStorageKey(user, "small-erp-orders"),
    seedOrders,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const fields: ActionField[] = [
    { key: "customer", label: "Cliente", placeholder: "Ex: Mercado Central" },
    { key: "amount", label: "Valor", type: "number", placeholder: "1200", step: 0.01, min: 0 },
    { key: "date", label: "Data", placeholder: "10/08/2026" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Pago", "Pendente", "Em atraso"],
      defaultValue: "Pendente",
    },
  ];

  const initialValues = editingOrder
    ? {
        customer: editingOrder.customer,
        amount: Number(parseCurrencyValue(editingOrder.amount)),
        date: editingOrder.date,
        status: editingOrder.status,
      }
    : {
        customer: "",
        amount: 0,
        date: new Date().toLocaleDateString("pt-BR"),
        status: "Pendente",
      };

  const handleSave = (values: Record<string, string | number>) => {
    const nextOrder: Order = {
      id: editingOrder ? editingOrder.id : generateEntityId("PED"),
      customer: String(values.customer || "Cliente novo"),
      amount: formatCurrencyValue(
        Number(values.amount ?? 0),
        getCompanyCurrency(user.tenantCode),
      ),
      date: String(values.date || new Date().toLocaleDateString("pt-BR")),
      status: (String(values.status || "Pendente") as Order["status"]),
    };

    if (editingOrder) {
      setOrderRows((current) => current.map((item) => (item.id === editingOrder.id ? nextOrder : item)));
    } else {
      setOrderRows((current) => [nextOrder, ...current]);
    }

    setEditingOrder(null);
  };

  const handleDelete = (order: Order) => {
    setOrderRows((current) => current.filter((item) => item.id !== order.id));
  };

  return (
    <ErpShell user={user} title="Pedidos" subtitle="Controle de pedidos e faturamento operacional">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Pedidos recentes</h3>
          <button
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            onClick={() => {
              setEditingOrder(null);
              setModalOpen(true);
            }}
            type="button"
          >
            Novo pedido
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {orderRows.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{order.id}</td>
                  <td className="px-4 py-3 text-slate-600">{order.customer}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{order.amount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        order.status === "Pago"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "Pendente"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{order.date}</td>
                  <td className="px-4 py-3">
                    <RowActionButtons
                      onDelete={() => handleDelete(order)}
                      onEdit={() => {
                        setEditingOrder(order);
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
        key={`${editingOrder?.id ?? "new"}-${modalOpen ? "open" : "closed"}`}
        description="Atualize ou cadastre um pedido no mock do ERP."
        fields={fields}
        initialValues={initialValues}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingOrder(null);
        }}
        onSubmit={handleSave}
        submitLabel={editingOrder ? "Salvar pedido" : "Criar pedido"}
        title={editingOrder ? "Editar pedido" : "Novo pedido"}
      />
    </ErpShell>
  );
}

function OrdersPage() {
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

  return <OrdersClient user={user} />;
}

export default dynamic(() => Promise.resolve(OrdersPage), { ssr: false });
