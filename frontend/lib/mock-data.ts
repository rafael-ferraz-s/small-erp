export type Role = "admin" | "super_admin" | "general_admin";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantName: string;
  tenantCode: string;
  permissions: string[];
};

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
  tone: "emerald" | "blue" | "amber" | "rose";
  action: string;
};

export type SalesPoint = {
  label: string;
  value: number;
};

export type RecentSale = {
  id: string;
  customer: string;
  amount: string;
  status: "Paid" | "Pending" | "Overdue";
  date: string;
};

export type LowStockItem = {
  sku: string;
  name: string;
  stock: number;
  minimum: number;
  status: "Low stock" | "Out of stock";
};

export type ReceivableItem = {
  customer: string;
  due: string;
  amount: string;
  status: "Overdue" | "Due this week";
};

export type DashboardData = {
  companyName: string;
  metricCards: DashboardMetric[];
  salesTrend: SalesPoint[];
  activeStoreSales: SalesPoint[];
  recentSales: RecentSale[];
  lowStock: LowStockItem[];
  pendingFinancials: ReceivableItem[];
};

export const mockAccounts: Record<
  string,
  { password: string; user: SessionUser }
> = {
  "admin@tenant.local": {
    password: "tenant123",
    user: {
      id: "usr-admin-01",
      name: "Ana Costa",
      email: "admin@tenant.local",
      role: "admin",
      tenantName: "Matriz Lojas do Vale",
      tenantCode: "TEN-001",
      permissions: [
        "dashboard:view",
        "orders:manage",
        "inventory:manage",
        "finance:view",
        "users:view",
      ],
    },
  },
  "superadmin@tenant.local": {
    password: "super123",
    user: {
      id: "usr-super-01",
      name: "Rafael Martins",
      email: "superadmin@tenant.local",
      role: "super_admin",
      tenantName: "Grupo Vale Empresarial",
      tenantCode: "TEN-000",
      permissions: [
        "dashboard:view",
        "tenants:manage",
        "orders:manage",
        "inventory:manage",
        "finance:manage",
        "users:manage",
      ],
    },
  },
  "general@tenant.local": {
    password: "general123",
    user: {
      id: "usr-general-01",
      name: "Marina Oliveira",
      email: "general@tenant.local",
      role: "general_admin",
      tenantName: "Plataforma Small ERP",
      tenantCode: "PLAT-ROOT",
      permissions: [
        "platform:view",
        "tenants:create",
        "tenants:manage",
        "users:manage",
        "dashboard:global",
      ],
    },
  },
};

const baseMetrics: DashboardMetric[] = [
  {
    label: "Total vendas",
    value: "R$ 42.350",
    delta: "+12.5%",
    tone: "emerald",
    action: "Ver faturamento",
  },
  {
    label: "Pedidos",
    value: "124",
    delta: "+8.2%",
    tone: "blue",
    action: "Ver pedidos",
  },
  {
    label: "Recebíveis",
    value: "R$ 8.420",
    delta: "-3.1%",
    tone: "amber",
    action: "Ver contas",
  },
  {
    label: "Baixo estoque",
    value: "7 itens",
    delta: "2 críticos",
    tone: "rose",
    action: "Reabastecer",
  },
];

export const getDashboardData = (
  role: Role,
  tenantName: string,
): DashboardData => {
  const isSuperAdmin = role === "super_admin";
  const isGeneralAdmin = role === "general_admin";

  const metricCards: DashboardMetric[] = isGeneralAdmin
    ? [
        {
          label: "Empresas ativas",
          value: "18",
          delta: "+5 este mês",
          tone: "emerald",
          action: "Ver empresas",
        },
        {
          label: "Receita consolidada",
          value: "R$ 1.280.450",
          delta: "+13.8%",
          tone: "blue",
          action: "Ver faturamento",
        },
        {
          label: "Onboarding pendente",
          value: "4",
          delta: "2 críticos",
          tone: "amber",
          action: "Acompanhar setup",
        },
        {
          label: "Alertas globais",
          value: "6",
          delta: "3 urgentes",
          tone: "rose",
          action: "Resolver blocos",
        },
      ]
    : isSuperAdmin
      ? [
          {
            label: "Filiais ativas",
            value: "12",
            delta: "+3 este mês",
            tone: "emerald",
            action: "Ver unidades",
          },
          {
            label: "Total de Vendas",
            value: "2.481",
            delta: "+9.7%",
            tone: "blue",
            action: "Ver operação",
          },
          {
            label: "Faturamento Total",
            value: "R$ 186.420",
            delta: "+5.4%",
            tone: "amber",
            action: "Ver contas",
          },
          {
            label: "Alertas globais",
            value: "9",
            delta: "4 críticos",
            tone: "rose",
            action: "Resolver itens",
          },
        ]
      : baseMetrics;

  return {
    companyName: tenantName,
    metricCards,
    salesTrend: [
      { label: "Jan", value: 23 },
      { label: "Fev", value: 28 },
      { label: "Mar", value: 32 },
      { label: "Abr", value: 30 },
      { label: "Mai", value: 39 },
      { label: "Jun", value: 48 },
    ],
    activeStoreSales: isSuperAdmin
      ? [
          { label: "Centro", value: 62 },
          { label: "Manaíra", value: 54 },
          { label: "Campina", value: 21 },
          { label: "Norte", value: 10 },
        ]
      : [],
    recentSales: [
      { id: "VND-1048", customer: "Mercado Central", amount: "R$ 2.490", status: "Paid", date: "Hoje, 14:30" },
      { id: "VND-1047", customer: "Ponto do Café", amount: "R$ 1.820", status: "Pending", date: "Hoje, 09:15" },
      { id: "VND-1046", customer: "Santa Luzia", amount: "R$ 3.060", status: "Overdue", date: "Ontem" },
      { id: "VND-1045", customer: "Avenida Food", amount: "R$ 980", status: "Paid", date: "15 mai" },
    ],
    lowStock: [
      { sku: "PRD-102", name: "Café Premium 500g", stock: 8, minimum: 15, status: "Low stock" },
      { sku: "PRD-210", name: "Papel Toalha 40un", stock: 0, minimum: 18, status: "Out of stock" },
      { sku: "PRD-330", name: "Biscoito Integral", stock: 11, minimum: 20, status: "Low stock" },
    ],
    pendingFinancials: [
      { customer: "Atacado Norte", due: "2 dias", amount: "R$ 4.200", status: "Overdue" },
      { customer: "Mercado Novo", due: "6 dias", amount: "R$ 1.380", status: "Due this week" },
      { customer: "Distribuidora B", due: "12 dias", amount: "R$ 2.840", status: "Due this week" },
    ],
  };
};
