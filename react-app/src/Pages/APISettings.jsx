import React, { useState } from "react";
import { Smartphone, ShieldCheck, CheckCircle, Copy, ExternalLink, Lock, Server } from "lucide-react";

export default function Settings({ config, setConfig, language, t }) {
  const [copied, setCopied] = useState(false);
  const isRtl = language === "ar";

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{t("apiIntegration")}</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t("metaCloud")}</p>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 uppercase tracking-widest">
          <ShieldCheck size={14} />
          <span>{t("securityLevel")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden group">
          <div className={`absolute top-0 ${isRtl ? "left-0 rounded-br-[4rem]" : "right-0 rounded-bl-[4rem]"} w-32 h-32 bg-slate-50 group-hover:bg-emerald-50 transition-colors duration-500`} />

          <div className="flex items-center space-x-5 rtl:space-x-reverse relative z-10">
            <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-600/20 shrink-0">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">{t("whatsappAccount")}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Device credentials</p>
            </div>
            <a
              href="https://developers.facebook.com/apps/"
              target="_blank"
              rel="noreferrer"
              className={`${isRtl ? "mr-auto" : "ml-auto"} p-2.5 hover:bg-slate-50 text-slate-300 hover:text-slate-600 rounded-xl transition-all`}
            >
              <ExternalLink size={18} />
            </a>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 rtl:mr-1 rtl:ml-0">{t("phoneId")}</label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition font-mono text-sm text-slate-700 shadow-sm"
                value={config.phoneNumberId}
                onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                placeholder="Meta Phone Number ID"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 rtl:mr-1 rtl:ml-0">{t("accessToken")}</label>
              <div className="relative group/token">
                <input
                  type="password"
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition font-mono text-sm text-slate-700 shadow-sm ${
                    isRtl ? "pl-12" : "pr-12"
                  }`}
                  value={config.accessToken}
                  onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                  placeholder="Permanent Token (EAAG...)"
                />
                <Lock size={16} className={`absolute ${isRtl ? "left-4" : "right-4"} top-4.5 text-slate-300 group-focus-within/token:text-emerald-500 transition-colors`} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 rtl:mr-1 rtl:ml-0">{t("verificationHash")}</label>
              <div className="flex space-x-3 rtl:space-x-reverse">
                <input
                  type="text"
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl p-4 outline-none font-mono text-xs text-slate-400 cursor-not-allowed shadow-inner"
                  value={config.verifyToken}
                  readOnly
                />
                <button
                  onClick={() => copyToClipboard(config.verifyToken)}
                  className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm"
                >
                  <Copy size={20} className={copied ? "text-emerald-500" : "text-slate-400"} />
                </button>
              </div>
            </div>

            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-slate-200 flex items-center justify-center space-x-3 rtl:space-x-reverse active:scale-[0.98]">
              <CheckCircle size={18} className="text-emerald-400" />
              <span>{t("validateDeploy")}</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center space-y-6">
            <div className="flex items-center space-x-5 rtl:space-x-reverse">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <Server size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{t("webhookConfig")}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Order synchronization</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 relative group">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{t("gatewayEndpoint")}</label>
              <div className="flex items-center gap-4 rtl:flex-row-reverse">
                <code className="text-xs font-mono text-slate-600 break-all leading-relaxed flex-1 bg-white p-3 rounded-xl border border-slate-200 shadow-inner">
                  {config.webhookUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(config.webhookUrl)}
                  className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
                >
                  {copied ? <CheckCircle size={20} className="text-emerald-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                <ShieldCheck size={14} className={`${isRtl ? "ml-2" : "mr-2"} text-emerald-500`} />
                {t("integrationChecklist")}
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { title: "Meta Portal", text: "Navigate to App Dashboard > WhatsApp > Configuration." },
                  { title: "Callback URL", text: "Paste the Gateway Endpoint into the Meta Webhook URL." },
                  { title: "Verify Hash", text: "Use the Verification Hash above to confirm the endpoint." },
                  { title: "Subscriptions", text: 'Subscribe to "messages" and "template_status" events.' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start space-x-4 rtl:space-x-reverse p-3 hover:bg-slate-50 rounded-2xl transition-colors group/step">
                    <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover/step:border-emerald-500 group-hover/step:text-emerald-600 transition-colors shrink-0 mt-0.5 shadow-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-0.5">{step.title}</p>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
