"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";

import { ActionModal, RowActionButtons, type ActionField } from "@/components/erp-actions";
import { ErpShell } from "@/components/erp-shell";
import { getCompanyCurrency } from "@/lib/company-settings";
import type { SessionUser } from "@/lib/mock-data";
import { getTenantStorageKey, usePersistentList } from "@/lib/mock-persistence";
import { formatCurrencyValue, generateEntityId, parseCurrencyValue, products as seedProducts, type Product } from "@/lib/mock-erp";
import { useSessionUser } from "@/lib/session-user";

function ProductsClient({ user }: { user: SessionUser }) {
  const { items: productRows, setItems: setProductRows } = usePersistentList<Product>(
    getTenantStorageKey(user, "small-erp-products"),
    seedProducts,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fields: ActionField[] = [
    { key: "name", label: "Nome do produto", placeholder: "Ex: Café Premium 500g" },
    { key: "category", label: "Categoria", placeholder: "Ex: Bebidas" },
    { key: "price", label: "Preço", type: "number", placeholder: "2990", step: 0.01, min: 0 },
    { key: "stock", label: "Estoque inicial", type: "number", placeholder: "45", min: 0 },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Ativo", "Baixo", "Inativo"],
      defaultValue: "Ativo",
    },
  ];

  const initialValues = editingProduct
    ? {
        name: editingProduct.name,
        category: editingProduct.category,
        price: Number(parseCurrencyValue(editingProduct.price)),
        stock: editingProduct.stock,
        status: editingProduct.status,
      }
    : {
        name: "",
        category: "",
        price: 0,
        stock: 0,
        status: "Ativo",
      };

  const handleSave = (values: Record<string, string | number>) => {
    const nextProduct: Product = {
      sku: editingProduct ? editingProduct.sku : generateEntityId("PRD"),
      name: String(values.name || "Novo produto"),
      category: String(values.category || "Geral"),
      price: formatCurrencyValue(
        Number(values.price ?? 0),
        getCompanyCurrency(user.tenantCode),
      ),
      stock: Number(values.stock ?? 0),
      status: (String(values.status || "Ativo") as Product["status"]),
    };

    if (editingProduct) {
      setProductRows((current) => current.map((item) => (item.sku === editingProduct.sku ? nextProduct : item)));
    } else {
      setProductRows((current) => [nextProduct, ...current]);
    }

    setEditingProduct(null);
  };

  const handleDelete = (product: Product) => {
    setProductRows((current) => current.filter((item) => item.sku !== product.sku));
  };

  return (
    <ErpShell user={user} title="Produtos" subtitle="Catálogo, estoque e revisão de preços">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Catálogo de produtos</h3>
          <button
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            type="button"
          >
            + Novo produto
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Estoque</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {productRows.map((product) => (
                <tr key={product.sku} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{product.sku}</td>
                  <td className="px-4 py-3 text-slate-600">{product.name}</td>
                  <td className="px-4 py-3 text-slate-600">{product.category}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{product.price}</td>
                  <td className="px-4 py-3 text-slate-600">{product.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        product.status === "Ativo"
                          ? "bg-emerald-100 text-emerald-700"
                          : product.status === "Baixo"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RowActionButtons
                      onDelete={() => handleDelete(product)}
                      onEdit={() => {
                        setEditingProduct(product);
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
        key={`${editingProduct?.sku ?? "new"}-${modalOpen ? "open" : "closed"}`}
        description="Preencha os dados do produto e salve a atualização no mock do ERP."
        fields={fields}
        initialValues={initialValues}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSave}
        submitLabel={editingProduct ? "Salvar alterações" : "Criar produto"}
        title={editingProduct ? "Editar produto" : "Novo produto"}
      />
    </ErpShell>
  );
}

function ProductsPage() {
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

  return <ProductsClient user={user} />;
}

export default dynamic(() => Promise.resolve(ProductsPage), { ssr: false });
