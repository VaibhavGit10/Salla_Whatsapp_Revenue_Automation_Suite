import React from "react";
import { Menu, Globe } from "lucide-react";

export default function Header({ language, setLanguage, onMenuClick }) {
  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-10 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-50 text-slate-600"
        >
          <Menu size={20} />
        </button>

        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.22em]">
            SallaFlow
          </p>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Automation Suite
          </h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Globe size={16} className="text-slate-500" />

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent outline-none text-[12px] font-bold text-slate-700"
          >
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
        </div>
      </div>
    </header>
  );
}
