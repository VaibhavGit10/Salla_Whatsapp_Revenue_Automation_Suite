import React from "react";
import { Search, Filter, Download, MessageSquare } from "lucide-react";

export default function Logs({ logs, onRefresh, language, t }) {
  const isRtl = language === "ar";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t("activityLogs")}</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.25em] mt-1.5">{t("metaCloud")}</p>
        </div>

        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="relative group">
            <Search size={16} className={`absolute ${isRtl ? "right-4" : "left-4"} top-3 text-slate-400 group-focus-within:text-emerald-500 transition-colors`} />
            <input
              type="text"
              placeholder={t("searchCustomer")}
              className={`bg-white border border-slate-200 rounded-xl py-3 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all w-80 shadow-sm ${
                isRtl ? "pr-11 pl-5" : "pl-11 pr-5"
              }`}
            />
          </div>

          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">
            <Filter size={18} />
          </button>

          <button
            onClick={onRefresh}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead className="bg-slate-50/70 border-b border-slate-100">
              <tr>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("customerPhone")}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("orderRef")}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("automation")}</th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("status")}</th>
                <th className={`px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ${isRtl ? "text-left" : "text-right"}`}>
                  {t("timestamp")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                  <td className="px-10 py-6 text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {log.customer_phone || log.customerPhone}
                  </td>
                  <td className="px-10 py-6 text-xs text-slate-500 font-mono tracking-tighter">{log.order_id || log.orderId || "N/A"}</td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-black px-3 py-2 bg-slate-100 rounded-xl text-slate-500 uppercase tracking-tighter border border-slate-200 group-hover:bg-white transition-colors">
                      {String(log.flow_type || log.flowType).replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                          log.status === "delivered" || log.status === "read" ? "bg-emerald-500" : log.status === "sent" ? "bg-blue-500" : "bg-red-500"
                        }`}
                      />
                      <span className="text-xs font-black text-slate-700 capitalize tracking-tight">{log.status}</span>
                    </div>
                  </td>
                  <td className={`px-10 py-6 text-[11px] text-slate-400 font-black uppercase tracking-widest tabular-nums ${isRtl ? "text-left" : "text-right"}`}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare size={48} className="mb-6 opacity-20" />
            <p className="text-sm font-black uppercase tracking-[0.25em]">No activity detected</p>
          </div>
        )}
      </div>
    </div>
  );
}
