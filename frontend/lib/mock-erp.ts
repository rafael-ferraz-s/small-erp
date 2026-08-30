export type Product = {
  sku: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: "Ativo" | "Baixo" | "Inativo";
};

export const generateEntityId = (prefix: string) => {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Math.random().toString(36).slice(2, 10).toUpperCase();

  return `${prefix}-${suffix}`;
};

export const parseCurrencyValue = (value?: string | number) => {
  const raw = String(value ?? "0").replace(/\s/g, "");

  if (!raw || raw === "NaN") {
    return 0;
  }

  const normalized = raw.replace(/[^\d,.-]/g, "");

  if (!normalized) {
    return 0;
  }

  if (normalized.includes(",") && normalized.includes(".")) {
    return Number(normalized.replace(/\./g, "").replace(",", "."));
  }

  if (normalized.includes(",")) {
    return Number(normalized.replace(",", "."));
  }

  return Number(normalized);
};

export const formatCurrencyValue = (value: number, currency = "BRL") => {
  const numericValue = Number.isFinite(value) ? value : 0;
  const locale = currency === "USD" ? "en-US" : "pt-BR";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

export type Order = {
  id: string;
  customer: string;
  amount: string;
  status: "Pago" | "Pendente" | "Em atraso";
  date: string;
};

export type FinanceRow = {
  customer: string;
  due: string;
  amount: string;
  status: "Pago" | "Pendente" | "Em atraso";
};

export type CompanyRow = {
  name: string;
  segment: string;
  status: "Ativa" | "Em onboarding" | "Pendente";
  users: number;
  turnover: string;
};

export type UserRow = {
  name: string;
  email: string;
  role: string;
  status: "Ativo" | "Inativo";
  lastLogin: string;
};

export type BranchRow = {
  id: string;
  name: string;
  city: string;
  manager: string;
  status: "Ativa" | "Em implantação" | "Pausada";
  totalSales: string;
};

export const products: Product[] = [
  { sku: "PRD-001", name: "Café Premium 500g", category: "Bebidas", price: "R$ 24,90", stock: 48, status: "Ativo" },
  { sku: "PRD-023", name: "Papel Toalha 40un", category: "Limpeza", price: "R$ 18,50", stock: 12, status: "Baixo" },
  { sku: "PRD-045", name: "Biscoito Integral", category: "Mercearia", price: "R$ 11,80", stock: 26, status: "Ativo" },
  { sku: "PRD-099", name: "Óleo de Soja 900ml", category: "Casa", price: "R$ 15,40", stock: 0, status: "Inativo" },
];

export const orders: Order[] = [
  { id: "PED-001", customer: "Mercado Central", amount: "R$ 2.490,00", status: "Pago", date: "06/08/2026" },
  { id: "PED-004", customer: "Ponto do Café", amount: "R$ 1.820,00", status: "Pendente", date: "07/08/2026" },
  { id: "PED-008", customer: "Santa Luzia", amount: "R$ 3.060,00", status: "Em atraso", date: "09/08/2026" },
  { id: "PED-010", customer: "Avenida Food", amount: "R$ 980,00", status: "Pago", date: "10/08/2026" },
];

export const financialRows: FinanceRow[] = [
  { customer: "Atacado Norte", due: "2 dias", amount: "R$ 4.200,00", status: "Em atraso" },
  { customer: "Mercado Novo", due: "6 dias", amount: "R$ 1.380,00", status: "Pendente" },
  { customer: "Distribuidora B", due: "12 dias", amount: "R$ 2.840,00", status: "Pendente" },
];

export const companyRows: CompanyRow[] = [
  { name: "Matriz Lojas do Vale", segment: "Varejo", status: "Ativa", users: 21, turnover: "R$ 420k" },
  { name: "Delícias do Norte", segment: "Food Service", status: "Em onboarding", users: 8, turnover: "R$ 120k" },
  { name: "Cafeteria Prime", segment: "Bebidas", status: "Ativa", users: 12, turnover: "R$ 180k" },
  { name: "Distribuição Alfa", segment: "Distribuição", status: "Pendente", users: 5, turnover: "R$ 70k" },
];

export const userRows: UserRow[] = [
  { name: "Ana Costa", email: "ana@lojasvale.com", role: "Admin", status: "Ativo", lastLogin: "Hoje, 08:30" },
  { name: "Bruno Rocha", email: "bruno@lojasvale.com", role: "Financeiro", status: "Ativo", lastLogin: "Ontem" },
  { name: "Carla Moreira", email: "carla@lojasvale.com", role: "Estoque", status: "Ativo", lastLogin: "Hoje, 07:40" },
  { name: "Diego Nunes", email: "diego@lojasvale.com", role: "Vendas", status: "Inativo", lastLogin: "10/08" },
];

export const branchRows: BranchRow[] = [
  { id: "FIL-001", name: "Filial Centro", city: "João Pessoa", manager: "Lívia Santos", status: "Ativa", totalSales: "R$ 62.400,00" },
  { id: "FIL-002", name: "Filial Manaíra", city: "João Pessoa", manager: "Igor Lima", status: "Ativa", totalSales: "R$ 54.870,00" },
  { id: "FIL-003", name: "Filial Campina", city: "Campina Grande", manager: "Rebeca Alves", status: "Em implantação", totalSales: "R$ 21.330,00" },
  { id: "FIL-004", name: "Filial Norte", city: "Natal", manager: "Mateus Gomes", status: "Pausada", totalSales: "R$ 10.980,00" },
];
