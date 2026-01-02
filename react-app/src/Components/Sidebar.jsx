import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Zap,
  History,
  Settings,
  MessageCircle,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "flows", label: "Automations", icon: Zap, path: "/flows" },
    { id: "logs", label: "History Logs", icon: History, path: "/logs" },
    { id: "settings", label: "API Settings", icon: Settings, path: "/settings" },
  ];

  const isExpanded = isHovered;

  return (
    <>
      <div
        className={`lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-md z-[60] transition-opacity duration-300 ${
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed inset-y-0 left-0 z-[70] bg-white border-r border-slate-100
        transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        flex flex-col shadow-[12px_0_50px_-15px_rgba(0,0,0,0.06)]
        overflow-x-hidden
        ${isExpanded ? "w-72" : "w-24"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:sticky lg:top-0 lg:h-screen`}
      >
        <div className="p-7 flex items-center justify-between h-24 shrink-0">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="min-w-[48px] h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20 border border-emerald-500">
              <MessageCircle size={26} />
            </div>

            <div
              className={`transition-all duration-300 ${
                isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 pointer-events-none"
              }`}
            >
              <span className="font-black text-slate-900 text-xl tracking-tight">SallaFlow</span>
              <div className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1">
                Automation Suite
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-3 text-slate-400 hover:text-slate-900"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2.5 pt-8 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`w-full flex items-center group rounded-2xl transition-all duration-300 relative
                ${isExpanded ? "px-5 py-4 space-x-5 rtl:space-x-reverse" : "justify-center py-4"}
                ${isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <Icon
                  size={24}
                  className={`transition-colors ${
                    isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />

                <span
                  className={`text-[15px] font-bold transition-all duration-300 whitespace-nowrap
                  ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 absolute pointer-events-none"}`}
                >
                  {item.label}
                </span>

                {isActive && isExpanded && <ChevronRight size={16} className="ml-auto opacity-50 rtl:mr-auto rtl:ml-0" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-5 border-t border-slate-50 shrink-0">
          <div className={`flex items-center rounded-2xl transition-all duration-300 ${isExpanded ? "bg-slate-50 p-4" : "justify-center p-3"}`}>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 border border-emerald-200">
              <ShieldCheck size={20} />
            </div>

            <div
              className={`ml-4 rtl:mr-4 rtl:ml-0 transition-all duration-300 overflow-hidden ${
                isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 absolute pointer-events-none"
              }`}
            >
              <p className="text-[11px] font-black uppercase">Verified Store</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Enterprise</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
