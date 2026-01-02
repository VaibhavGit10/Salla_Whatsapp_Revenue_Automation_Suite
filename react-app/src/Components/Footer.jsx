import React from "react";
import { ShieldCheck } from "lucide-react";

const AppFooter = () => {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="h-14 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
          <ShieldCheck size={14} className="text-emerald-600" />
          SALLAFLOW AUTOMATION SUITE • TIER 1 VERIFIED ACCOUNT
        </div>

        <div className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
          DEVELOPED BY FI DIGITAL SYNERGY VENTURES GROUP
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
