import React from "react";
import {
  ShoppingCart,
  CheckCircle,
  MessageSquare,
  ArrowUpRight,
  Target,
  Users,
  Zap,
  Calendar,
} from "lucide-react";

const MOCK_DATA = [
  { name: "Sat", revenue: 4200 },
  { name: "Sun", revenue: 3800 },
  { name: "Mon", revenue: 5900 },
  { name: "Tue", revenue: 5300 },
  { name: "Wed", revenue: 6100 },
  { name: "Thu", revenue: 7900 },
  { name: "Fri", revenue: 8500 },
];

export default function Dashboard({ language, t }) {
  const isRtl = language === "ar";

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t("storeOverview")}
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">
            {t("realTimePerformance")}
          </p>
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button className="flex items-center space-x-2.5 rtl:space-x-reverse bg-white px-4 py-2 rounded-xl border border-slate-200 text-[11px] font-black text-slate-600 hover:border-emerald-300 transition-all shadow-sm uppercase tracking-widest">
            <Calendar size={14} />
            <span>{t("selectTimeRange")}</span>
          </button>
        </div>
      </div>

      {/* Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-7 border border-slate-100 shadow-sm overflow-hidden relative min-h-[220px]">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                {t("revenueImpact")} (SAR)
              </span>
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black">
                <ArrowUpRight size={12} />
                <span>+24.8%</span>
              </div>
            </div>

            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
              SAR 34,910<span className="text-slate-300 text-xl">.00</span>
            </h3>
          </div>

          {/* Minimal Chart */}
          <div className="mt-8">
            <MiniAreaChart data={MOCK_DATA} />
          </div>

          {/* Soft Background */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-emerald-50/60 to-transparent pointer-events-none" />
        </div>

        <StatCardSimple
          icon={<ShoppingCart size={20} />}
          label={t("abandonedCarts")}
          value="284"
          subValue={t("recovery")}
          color="emerald"
        />

        <StatCardSimple
          icon={<CheckCircle size={20} />}
          label={t("codConfirmation")}
          value="94.8%"
          subValue="+4% this week"
          color="blue"
        />
      </div>

      {/* Highlight row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <HighlightCard
          label={t("totalSent")}
          value="2.8k"
          icon={<MessageSquare size={16} />}
          color="emerald"
        />
        <HighlightCard
          label={t("activeFlows")}
          value="06"
          icon={<Zap size={16} />}
          color="orange"
        />
        <HighlightCard
          label={t("ksaReach")}
          value="1.8k"
          icon={<Users size={16} />}
          color="indigo"
        />
        <HighlightCard
          label={t("delivered")}
          value="99.2%"
          icon={<CheckCircle size={16} />}
          color="blue"
        />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">
              {t("weeklyTrend")}
            </h3>
            <Target size={18} className="text-slate-200" />
          </div>

          <MiniLineChart data={MOCK_DATA} isRtl={isRtl} />
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] mb-6">
              {t("serviceHealth")}
            </h3>
            <div className="space-y-4">
              <HealthStatus label={t("sallaApiSync")} status="online" />
              <HealthStatus label={t("metaCloud")} status="online" />
              <HealthStatus label={t("webhooksHub")} status="online" />
            </div>
          </div>

          <div className="mt-8 p-5 bg-slate-50/70 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {t("monthlyQuota")}
              </span>
              <span className="text-[10px] font-black text-emerald-600">
                8,240 / 10,000
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "82%" }} />
            </div>
            <p className="text-[9px] font-bold text-slate-400 mt-2 text-right uppercase rtl:text-left">
              82% {t("utilized")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** -----------------------------
 * Small helper components
 * ------------------------------ */

function MiniAreaChart({ data }) {
  const values = data.map((d) => d.revenue);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / (max - min || 1)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="h-24 w-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="miniArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopOpacity="0.25" stopColor="#10b981" />
            <stop offset="100%" stopOpacity="0" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#miniArea)" />
        <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2" />
      </svg>
    </div>
  );
}

function MiniLineChart({ data, isRtl }) {
  const values = data.map((d) => d.revenue);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const points = values
    .map((v, i) => {
      const idx = isRtl ? values.length - 1 - i : i;
      const x = (idx / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / (max - min || 1)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="h-56 w-full rounded-2xl bg-slate-50/60 border border-slate-100 p-4">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2.5" />
      </svg>
      <div className="mt-3 flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
        {data.map((d) => (
          <span key={d.name}>{d.name}</span>
        ))}
      </div>
    </div>
  );
}

function StatCardSimple({ icon, label, value, subValue, color }) {
  const colors = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
  };

  return (
    <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:border-emerald-200 transition-all cursor-default group hover:shadow-md">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${colors[color]} group-hover:scale-110 transition-transform shadow-sm`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
      <div className="flex items-baseline space-x-2 rtl:space-x-reverse">
        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{subValue}</span>
      </div>
    </div>
  );
}

function HighlightCard({ label, value, icon, color }) {
  const colors = {
    emerald: "text-emerald-500",
    orange: "text-orange-500",
    indigo: "text-indigo-500",
    blue: "text-blue-500",
  };

  return (
    <div className="bg-white px-6 py-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 group-hover:text-slate-500 transition-colors">{label}</p>
        <h4 className="text-xl font-black text-slate-900 leading-none">{value}</h4>
      </div>
      <div className={`${colors[color]} opacity-20 group-hover:opacity-40 transition-opacity`}>{icon}</div>
    </div>
  );
}

function HealthStatus({ label, status }) {
  return (
    <div className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-colors">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <div className={`w-2 h-2 rounded-full ${status === "online" ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"}`} />
        <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${status === "online" ? "text-emerald-600" : "text-red-600"}`}>
          {status}
        </span>
      </div>
    </div>
  );
}
