import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiPackage,
  FiDollarSign,
  FiActivity,
  FiArrowUpRight,
} from "react-icons/fi";
import CustomTabs from "../../../components/Tabs/CustomTabs";
import { fetchDashboardStats } from "../../../store/Slices/DashboardStatsSlice";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";
import { EmptyState, LoadingState } from "../../../components/ui";
import { pathTo } from "../../../utils/appMode";
import { Link } from "react-router-dom";

const PIE_COLORS = ["#0f172a", "#b6953a", "#0f766e", "#64748b", "#dc2626"];

const STAT_THEMES = [
  {
    icon: FiDollarSign,
    chip: "bg-amber-100 text-amber-800",
    ring: "from-amber-500/15 via-transparent to-transparent",
  },
  {
    icon: FiTrendingUp,
    chip: "bg-emerald-100 text-emerald-800",
    ring: "from-emerald-500/15 via-transparent to-transparent",
  },
  {
    icon: FiUsers,
    chip: "bg-sky-100 text-sky-800",
    ring: "from-sky-500/15 via-transparent to-transparent",
  },
  {
    icon: FiPackage,
    chip: "bg-teal-100 text-teal-800",
    ring: "from-teal-500/15 via-transparent to-transparent",
  },
  {
    icon: FiActivity,
    chip: "bg-slate-200 text-slate-800",
    ring: "from-slate-500/10 via-transparent to-transparent",
  },
  {
    icon: FiTrendingDown,
    chip: "bg-rose-100 text-rose-800",
    ring: "from-rose-500/15 via-transparent to-transparent",
  },
];

const formatPKR = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
      {label ? (
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
      ) : null}
      {payload.map((entry) => (
        <p
          key={entry.dataKey || entry.name}
          className="text-sm font-semibold text-slate-900"
        >
          {entry.name}:{" "}
          {typeof entry.value === "number"
            ? formatPKR(entry.value)
            : entry.value}
        </p>
      ))}
    </div>
  );
};

const KpiCard = ({ title, value, textColor, index }) => {
  const theme = STAT_THEMES[index % STAT_THEMES.length];
  const Icon = theme.icon;
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm",
        "transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md",
        "fade-in",
      ].join(" ")}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.ring}`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
            {title}
          </p>
          <p
            className={[
              "mt-2 truncate text-2xl font-extrabold tracking-tight sm:text-[1.65rem]",
              textColor || "text-slate-900",
            ].join(" ")}
          >
            {value}
          </p>
        </div>
        <span
          className={[
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            theme.chip,
          ].join(" ")}
        >
          <Icon className="text-lg" />
        </span>
      </div>
    </div>
  );
};

const ChartCard = ({
  title,
  subtitle,
  tabs,
  activeTab,
  setActiveTab,
  children,
}) => (
  <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
      <div className="min-w-0">
        <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{subtitle}</p>
        ) : null}
      </div>
      {tabs ? (
        <div className="shrink-0">
          <div className="[&>div]:mb-0">
            <CustomTabs
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
        </div>
      ) : null}
    </div>
    <div className="flex-1 p-4 sm:p-5">{children}</div>
  </div>
);

const PiePanel = ({ title, subtitle, data, emptyLabel }) => {
  const hasData = Array.isArray(data) && data.some((d) => Number(d.value) > 0);
  const total = useMemo(
    () =>
      (data || []).reduce((sum, d) => sum + Number(d?.value || 0), 0),
    [data]
  );

  return (
    <ChartCard title={title} subtitle={subtitle}>
      {!hasData ? (
        <EmptyState title={emptyLabel || "No data yet"} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="relative">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={4}
                  stroke="#fff"
                  strokeWidth={3}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Total
                </p>
                <p className="text-sm font-extrabold text-slate-900">
                  {formatPKR(total)}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {data.map((entry, index) => {
              const pct =
                total > 0
                  ? Math.round((Number(entry.value || 0) / total) * 100)
                  : 0;
              return (
                <div
                  key={entry.name}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                      <span className="truncate text-xs font-semibold text-slate-700">
                        {entry.name}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-slate-900">
                      {formatPKR(entry.value)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ChartCard>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const dashboardStats = useSelector((state) => state.DashboardStatsState);
  const [activeSalesTab, setActiveSalesTab] = useState(0);
  const [activeExpensesTab, setActiveExpensesTab] = useState(0);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const cards = useMemo(() => {
    const data = dashboardStats.data;
    if (!data) return [];
    if (Array.isArray(data.cards)) return data.cards;
    if (Array.isArray(data)) return data;
    return [];
  }, [dashboardStats.data]);

  const charts = useMemo(() => {
    const data = dashboardStats.data;
    if (!data) return {};
    if (data.charts) return data.charts;
    return {
      dailySales: data.dailySales || [],
      monthlySales: data.monthlySales || [],
      yearlySales: data.yearlySales || [],
      dailyExpenses: data.dailyExpenses || [],
      monthlyExpenses: data.monthlyExpenses || [],
      yearlyExpenses: data.yearlyExpenses || [],
      receivablePayable: data.receivablePayable || [],
      salesVsExpenses: data.salesVsExpenses || [],
      paymentsSplit: data.paymentsSplit || [],
      inventoryFlow: data.inventoryFlow || [],
    };
  }, [dashboardStats.data]);

  const periodTabs = [
    { label: "Daily" },
    { label: "Monthly" },
    { label: "Yearly" },
  ];

  const salesData = useMemo(() => {
    if (activeSalesTab === 0) return charts.dailySales || [];
    if (activeSalesTab === 1) return charts.monthlySales || [];
    return charts.yearlySales || [];
  }, [charts, activeSalesTab]);

  const expensesData = useMemo(() => {
    if (activeExpensesTab === 0) return charts.dailyExpenses || [];
    if (activeExpensesTab === 1) return charts.monthlyExpenses || [];
    return charts.yearlyExpenses || [];
  }, [charts, activeExpensesTab]);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-PK", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    []
  );

  if (dashboardStats.loading) {
    return (
      <BodyWrapper>
        <LoadingState label="Loading dashboard..." />
      </BodyWrapper>
    );
  }

  if (dashboardStats.isError) {
    return (
      <BodyWrapper>
        <div className="mb-6 overflow-hidden rounded-2xl border border-red-200 bg-red-50 px-5 py-6">
          <h1 className="text-xl font-bold text-red-800">Dashboard</h1>
          <p className="mt-1 text-sm text-red-600">
            Error fetching dashboard data.
          </p>
        </div>
      </BodyWrapper>
    );
  }

  return (
    <BodyWrapper>
      {/* Hero */}
      <section className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 text-white shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(182,149,58,0.35),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(15,118,110,0.28),_transparent_45%)]" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200/90">
              Borban PCU
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Business Dashboard
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-slate-300">
              Live snapshot of sales, expenses, parties, and stock — {todayLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={pathTo("counter-sale")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-amber-400"
            >
              Counter Sale
              <FiArrowUpRight />
            </Link>
            <Link
              to={pathTo("report")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Reports
            </Link>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((stat, index) => (
          <KpiCard
            key={stat.title || index}
            title={stat.title}
            value={stat.value}
            textColor={stat.textColor}
            index={index}
          />
        ))}
      </div>

      {/* Balance pies */}
      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PiePanel
          title="Receivable vs Payable"
          subtitle="Outstanding party balances"
          data={charts.receivablePayable || []}
          emptyLabel="No receivable / payable data"
        />
        <PiePanel
          title="Sales vs Expenses"
          subtitle="Lifetime totals comparison"
          data={charts.salesVsExpenses || []}
          emptyLabel="No sales / expense totals yet"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PiePanel
          title="Payments Split"
          subtitle="Customer receipts vs supplier payments"
          data={charts.paymentsSplit || []}
          emptyLabel="No payment activity yet"
        />
        <PiePanel
          title="Inventory Flow"
          subtitle="Stock movement overview"
          data={charts.inventoryFlow || []}
          emptyLabel="No inventory movement yet"
        />
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Sales Overview"
          subtitle="Trend by selected period"
          tabs={periodTabs}
          activeTab={activeSalesTab}
          setActiveTab={setActiveSalesTab}
        >
          {!salesData.length ? (
            <EmptyState title="No sales in this period" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={salesData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesBarFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4b45c" stopOpacity={1} />
                    <stop offset="100%" stopColor="#b6953a" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 6"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Legend />
                <Bar
                  dataKey="sales"
                  name="Sales"
                  fill="url(#salesBarFill)"
                  radius={[10, 10, 4, 4]}
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Expenses Overview"
          subtitle="Spend trend by selected period"
          tabs={periodTabs}
          activeTab={activeExpensesTab}
          setActiveTab={setActiveExpensesTab}
        >
          {!expensesData.length ? (
            <EmptyState title="No expenses in this period" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={expensesData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 6"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  fill="url(#expenseFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </BodyWrapper>
  );
};

export default Dashboard;
