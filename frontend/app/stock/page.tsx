"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";

import { ActionModal, type ActionField } from "@/components/erp-actions";
import { ErpShell } from "@/components/erp-shell";
import type { SessionUser } from "@/lib/mock-data";
import { getTenantStorageKey, usePersistentList } from "@/lib/mock-persistence";
import { generateEntityId, products as seedProducts, type Product } from "@/lib/mock-erp";
import { useSessionUser } from "@/lib/session-user";

type StockAlert = {
  id: string;
  item: string;
  stock: number;
  min: number;
  status: "Baixo" | "Sem estoque";
};

const seedAlerts: StockAlert[] = [
  { id: "EST-001", item: "Café Premium 500g", stock: 8, min: 15, status: "Baixo" },
  { id: "EST-002", item: "Papel Toalha 40un", stock: 0, min: 18, status: "Sem estoque" },
  { id: "EST-003", item: "Biscoito Integral", stock: 11, min: 20, status: "Baixo" },
];

function StockClient({ user }: { user: SessionUser }) {
  const { items: productRows, setItems: setProductRows } = usePersistentList<Product>(
    getTenantStorageKey(user, "small-erp-products"),
    seedProducts,
  );
  const { items: alerts, setItems: setAlerts } = usePersistentList<StockAlert>(
    getTenantStorageKey(user, "small-erp-stock-alerts"),
    seedAlerts,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<StockAlert | null>(null);
  const [quantityError, setQuantityError] = useState<string>("");

  const productOptions = productRows.map((product) => `${product.name} (${product.sku})`);

  const fields: ActionField[] = [
    {
      key: "productKey",
      label: "Produto",
      type: "select",
      options: productOptions,
      defaultValue: productOptions[0] ?? "",
    },
    { key: "quantity", label: "Quantidade a repor", type: "number", placeholder: "25", min: 0, step: 1 },
  ];

  const editingProduct = productRows.find((product) => product.name === editingAlert?.item);
  const initialValues = editingAlert
    ? {
        productKey: editingProduct ? `${editingProduct.name} (${editingProduct.sku})` : editingAlert.item,
        quantity: 0,
      }
    : { productKey: productOptions[0] ?? "", quantity: 0 };

  const handleSave = (values: Record<string, string | number>) => {
    setQuantityError("");
    const selectedValue = String(values.productKey || productOptions[0] || "");
    const selectedProduct = productRows.find(
      (product) => `${product.name} (${product.sku})` === selectedValue || product.name === selectedValue,
    );

    if (!selectedProduct) {
      setQuantityError("Selecione um produto para repor estoque.");
      return false;
    }

    const rawQuantity = values.quantity;

    if (typeof rawQuantity === "boolean") {
      setQuantityError("A quantidade deve ser um número inteiro.");
      return false;
    }

    const quantityToAdd = typeof rawQuantity === "number" ? rawQuantity : Number(rawQuantity ?? 0);

    if (!Number.isInteger(quantityToAdd) || quantityToAdd < 0) {
      setQuantityError("A quantidade deve ser um número inteiro.");
      return false;
    }

    const nextStock = selectedProduct.stock + quantityToAdd;
    const existingAlert = alerts.find((item) => item.item === selectedProduct.name);
    const nextStatus: StockAlert["status"] = nextStock === 0 ? "Sem estoque" : "Baixo";
    const nextAlert: StockAlert = {
      id: editingAlert?.id || existingAlert?.id || generateEntityId("EST"),
      item: selectedProduct.name,
      stock: nextStock,
      min: editingAlert?.min ?? existingAlert?.min ?? 15,
      status: nextStatus,
    };

    setProductRows((current) =>
      current.map((item) =>
        item.sku === selectedProduct.sku
          ? {
              ...item,
              stock: nextStock,
              status: nextStock === 0 ? "Inativo" : nextStock <= 10 ? "Baixo" : "Ativo",
            }
          : item,
      ),
    );

    setAlerts((current) => {
      const hasMatchingAlert = current.some(
        (item) =>
          item.item === selectedProduct.name ||
          (editingAlert?.id ? item.id === editingAlert.id : false),
      );

      if (hasMatchingAlert) {
        return current.map((item) =>
          item.item === selectedProduct.name ||
          (editingAlert?.id ? item.id === editingAlert.id : false)
            ? { ...nextAlert, id: item.id || nextAlert.id }
            : item,
        );
      }

      return [nextAlert, ...current];
    });

    setEditingAlert(null);
    return true;
  };

  return (
    <ErpShell user={user} title="Estoque" subtitle="Movimentações e alertas de inventário">
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Alertas de estoque</h3>
            <button
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
              onClick={() => {
                setEditingAlert(null);
                setQuantityError("");
                setModalOpen(true);
              }}
              type="button"
            >
              Repor estoque
            </button>
          </div>
          {quantityError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {quantityError}
            </div>
          ) : null}
          <div className="mt-5 space-y-3">
            {alerts.map((alert, index) => (
              <div key={`${alert.id ?? "legacy"}-${alert.item}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-800">{alert.item}</p>
                    <p className="text-xs text-slate-500">Estoque {alert.stock} / mínimo {alert.min}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        alert.status === "Sem estoque" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {alert.status}
                    </span>
                    <button
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700"
                      onClick={() => {
                        setEditingAlert({
                          ...alert,
                          id: alert.id || generateEntityId("EST"),
                        });
                        setQuantityError("");
                        setModalOpen(true);
                      }}
                      type="button"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Últimas movimentações</h3>
          <div className="mt-5 space-y-3">
            {[
              { movement: "Entrada de mercadoria", qty: "+120", when: "Hoje, 09:15" },
              { movement: "Venda registrada", qty: "-18", when: "Hoje, 08:40" },
              { movement: "Ajuste de inventário", qty: "+3", when: "Ontem, 17:20" },
            ].map((movement) => (
              <div key={movement.when} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="font-medium text-slate-800">{movement.movement}</p>
                  <p className="text-xs text-slate-500">{movement.when}</p>
                </div>
                <span className="text-sm font-semibold text-slate-700">{movement.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ActionModal
        key={`${editingAlert?.id ?? "new"}-${modalOpen ? "open" : "closed"}`}
        description="Atualize o inventário do item no mock do ERP."
        fields={fields}
        initialValues={initialValues}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAlert(null);
        }}
        onSubmit={handleSave}
        submitLabel={editingAlert ? "Salvar ajuste" : "Registrar ajuste"}
        title={editingAlert ? "Editar ajuste de estoque" : "Repor estoque"}
      />
    </ErpShell>
  );
}

function StockPage() {
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

  return <StockClient user={user} />;
}

export default dynamic(() => Promise.resolve(StockPage), { ssr: false });
