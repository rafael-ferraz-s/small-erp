"use client";

import { useState } from "react";

export type ActionField = {
  key: string;
  label: string;
  type?: "text" | "number" | "select";
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
  min?: number;
  step?: number | string;
};

export function ActionModal({
  isOpen,
  title,
  description,
  submitLabel,
  fields,
  initialValues,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  submitLabel: string;
  fields: ActionField[];
  initialValues: Record<string, string | number>;
  onClose: () => void;
  onSubmit: (values: Record<string, string | number>) => boolean | void | Promise<boolean | void>;
}) {
  const [formValues, setFormValues] = useState<Record<string, string | number>>(initialValues);

  if (!isOpen) {
    return null;
  }

  const handleChange = (key: string, value: string | number) => {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const shouldClose = await onSubmit(formValues);

    if (shouldClose !== false) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">Ação</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            aria-label="Fechar modal"
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-500 hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-600">{description}</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {fields.map((field) => {
            const fieldValue = String(formValues[field.key] ?? field.defaultValue ?? "");

            if (field.type === "select") {
              return (
                <label key={field.key} className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">{field.label}</span>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    onChange={(event) => handleChange(field.key, event.target.value)}
                    value={fieldValue}
                  >
                    <option value="">Selecione...</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            return (
              <label key={field.key} className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">{field.label}</span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  inputMode={field.type === "number" ? "decimal" : "text"}
                  min={field.min}
                  onChange={(event) =>
                    handleChange(field.key, field.type === "number" ? Number(event.target.value || 0) : event.target.value)
                  }
                  placeholder={field.placeholder}
                  step={field.step ?? (field.type === "number" ? "0.01" : undefined)}
                  type={field.type ?? "text"}
                  value={fieldValue}
                />
              </label>
            );
          })}

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
              type="submit"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RowActionButtons({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        onClick={onEdit}
        type="button"
      >
        Editar
      </button>
      <button
        className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
        onClick={onDelete}
        type="button"
      >
        Excluir
      </button>
    </div>
  );
}
