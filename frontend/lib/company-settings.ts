"use client";

export type CompanySettings = {
  tenantName: string;
  cnpj: string;
  city: string;
  plan: string;
  currency: string;
  timezone: string;
};

const getCompanySettingsKey = (tenantCode: string) =>
  `small-erp-company-settings:${tenantCode}`;

export const defaultCompanySettings = (tenantName: string): CompanySettings => ({
  tenantName,
  cnpj: "12.345.678/0001-90",
  city: "João Pessoa",
  plan: "ERP Pro",
  currency: "BRL",
  timezone: "UTC-3",
});

export const getCompanySettings = (
  tenantName: string,
  tenantCode: string,
): CompanySettings => {
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(getCompanySettingsKey(tenantCode)) ?? "{}",
    );
    const defaults = defaultCompanySettings(tenantName);

    return {
      tenantName,
      cnpj: stored.cnpj ?? defaults.cnpj,
      city: stored.city ?? defaults.city,
      plan: stored.plan ?? defaults.plan,
      currency: stored.currency ?? defaults.currency,
      timezone: stored.timezone ?? defaults.timezone,
    };
  } catch {
    return defaultCompanySettings(tenantName);
  }
};

export const getCompanyCurrency = (tenantCode: string) => {
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(getCompanySettingsKey(tenantCode)) ?? "{}",
    );
    return stored.currency ?? "BRL";
  } catch {
    return "BRL";
  }
};

export const saveCompanySettings = (
  tenantCode: string,
  settings: CompanySettings,
) => {
  window.localStorage.setItem(
    getCompanySettingsKey(tenantCode),
    JSON.stringify(settings),
  );
};
