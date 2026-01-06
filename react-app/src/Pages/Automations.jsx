import React, { useEffect, useRef, useState } from "react";
import {
  Plus,
  ShoppingCart,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  X,
  User,
  Hash,
  Store,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";
import { FlowStatus, FlowType } from "../types";

const TEMPLATE_VARIABLES = [
  { label: "Customer", value: "{{customer_name}}", icon: <User size={14} /> },
  { label: "Order", value: "{{order_id}}", icon: <Hash size={14} /> },
  { label: "Store", value: "{{store_name}}", icon: <Store size={14} /> },
  { label: "Link", value: "{{cart_link}}", icon: <LinkIcon size={14} /> },
];

export default function Automations({ flows, onSaveFlow, onDeleteFlow, language, t }) {
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const textAreaRef = useRef(null);

  const isRtl = language === "ar";

  useEffect(() => {
    if (selectedFlow) {
      setTimeout(() => setIsDrawerOpen(true), 10);
    } else {
      setIsDrawerOpen(false);
    }
  }, [selectedFlow]);

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedFlow(null);
      setIsAddingNew(false);
    }, 300);
  };

  const toggleFlowStatus = async (id, e) => {
    e.stopPropagation();
  
    const flow = flows.find((f) => f.id === id);
    if (!flow) return;
  
    const updated = {
      ...flow,
      status:
        flow.status === FlowStatus.ACTIVE
          ? FlowStatus.INACTIVE
          : FlowStatus.ACTIVE,
    };
  
    try {
      await onSaveFlow(updated);
      // ✅ Parent will re-fetch / update flows
    } catch (error) {
      console.error("Failed to update flow status:", error);
      alert("Failed to update flow status. Please try again.");
    }
  };
  

  const deleteFlow = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this automation?")) {
      try {
        await onDeleteFlow(id);
      } catch (error) {
        console.error("Failed to delete flow:", error);
        alert("Failed to delete flow. Please try again.");
      }
    }
  };

  const insertVariable = (variable) => {
    if (!selectedFlow || !textAreaRef.current) return;

    const start = textAreaRef.current.selectionStart;
    const end = textAreaRef.current.selectionEnd;
    const text = selectedFlow.template;

    const newTemplate = text.substring(0, start) + variable + text.substring(end);
    setSelectedFlow({ ...selectedFlow, template: newTemplate });
  };

  const addNewFlow = () => {
    const newId = Math.random().toString(36).substr(2, 9);

    const newFlow = {
      id: newId,
      type: FlowType.CUSTOM,
      name: t("newFlow"),
      description: "Define your custom automated triggers here.",
      status: FlowStatus.INACTIVE,
      template: "Hi {{customer_name}}, this is a message from {{store_name}}.",
      delayMinutes: 0,
    };

    setSelectedFlow(newFlow);
    setIsAddingNew(true);
  };

  const saveChanges = async () => {
    if (!selectedFlow) return;

    try {
      // Ensure flow has required fields
      const flowToSave = {
        ...selectedFlow,
        type: selectedFlow.type || FlowType.CUSTOM,
        status: selectedFlow.status || FlowStatus.INACTIVE,
        template: selectedFlow.template || "",
        delayMinutes: selectedFlow.delayMinutes || 0,
        description: selectedFlow.description || ""
      };
      
      await onSaveFlow(flowToSave);
      handleCloseDrawer();
    } catch (error) {
      console.error("Failed to save flow:", error);
      alert("Failed to save flow. Please try again.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t("messagingFlows")}</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.25em] mt-1.5">{t("messagingFlows")}</p>
        </div>

        <button
          onClick={addNewFlow}
          className="flex items-center justify-center space-x-3 rtl:space-x-reverse bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 font-black text-[11px] uppercase tracking-widest"
        >
          <Plus size={16} />
          <span>{t("newFlow")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {flows.map((flow) => (
          <div
            key={flow.id}
            className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all duration-500 cursor-pointer"
            onClick={() => setSelectedFlow({ ...flow })}
          >
            <div className="p-7">
              <div className="flex justify-between items-start mb-5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                    flow.status === FlowStatus.ACTIVE
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 scale-105"
                      : "bg-slate-50 text-slate-300 border-slate-100"
                  }`}
                >
                  {flow.type === FlowType.ABANDONED_CART ? (
                    <ShoppingCart size={22} />
                  ) : flow.type === FlowType.COD_CONFIRMATION ? (
                    <ShieldCheck size={22} />
                  ) : (
                    <Zap size={22} />
                  )}
                </div>

                <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                  <button onClick={(e) => deleteFlow(flow.id, e)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>

                  <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={flow.status === FlowStatus.ACTIVE}
                      onChange={(e) => toggleFlowStatus(flow.id, e)}
                    />
                    <div
                      className="relative w-9 h-[18px] bg-slate-200 rounded-full peer
                      peer-checked:bg-emerald-500
                      after:content-[''] after:absolute after:top-[3px] after:left-[3px]
                      after:bg-white after:border after:border-slate-300 after:rounded-full
                      after:h-3 after:w-3 after:transition-all
                      peer-checked:after:translate-x-[18px] peer-checked:after:border-white"
                    />
                  </label>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition tracking-tight">{flow.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 line-clamp-2 min-h-[32px]">{flow.description}</p>

              <div className="flex items-center text-[10px] font-black text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 w-fit uppercase tracking-tighter rtl:space-x-reverse">
                <Clock size={14} className="mr-2 rtl:ml-2 rtl:mr-0 text-emerald-500" />
                {flow.delayMinutes === 0 ? t("instant") : `${flow.delayMinutes}M ${t("delay")}`}
              </div>
            </div>

            <div className="px-7 py-4 bg-slate-50/20 border-t border-slate-50 flex justify-between items-center group-hover:bg-emerald-50/50 transition-colors">
              <span
                className={`text-[10px] font-black tracking-[0.15em] uppercase ${
                  flow.status === FlowStatus.ACTIVE ? "text-emerald-600" : "text-slate-300"
                }`}
              >
                {t("status")} {flow.status}
              </span>
              <div className="flex items-center text-emerald-600 text-[11px] font-black uppercase tracking-widest">
                {t("edit")}
                <ArrowRight size={14} className={`ml-2 rtl:mr-2 rtl:ml-0 group-hover:translate-x-1.5 transition-transform ${isRtl ? "rotate-180" : ""}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedFlow && (
        <>
          <div
            className={`fixed inset-0 z-[100] transition-opacity duration-300 bg-slate-900/20 backdrop-blur-md ${
              isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={handleCloseDrawer}
          />

          <div
            className={`fixed inset-y-0 ${isRtl ? "left-0 border-r" : "right-0 border-l"} z-[110] w-full max-w-xl bg-white shadow-2xl
            transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            border-slate-100 flex flex-col
            ${isDrawerOpen ? "translate-x-0" : isRtl ? "-translate-x-full" : "translate-x-full"}`}
          >
            <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{isAddingNew ? t("newFlow") : t("edit")}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5">{t("suite")}</p>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="p-3 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
              <section className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 rtl:mr-1 rtl:ml-0">{t("flowName")}</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition font-bold text-slate-800 text-sm shadow-sm"
                    value={selectedFlow.name}
                    onChange={(e) => setSelectedFlow({ ...selectedFlow, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 rtl:mr-1 rtl:ml-0">{t("delayMinutes")}</label>
                    <div className="relative">
                      <input
                        type="number"
                        className={`w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:border-emerald-500 outline-none transition font-bold text-slate-800 text-sm shadow-sm ${
                          isRtl ? "pl-12" : "pr-12"
                        }`}
                        value={selectedFlow.delayMinutes}
                        onChange={(e) => setSelectedFlow({ ...selectedFlow, delayMinutes: parseInt(e.target.value || "0", 10) || 0 })}
                      />
                      <Clock size={18} className={`absolute ${isRtl ? "left-4" : "right-4"} top-4 text-slate-300`} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 rtl:mr-1 rtl:ml-0">{t("systemUuid")}</label>
                    <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-4 font-mono text-[11px] text-slate-500 uppercase flex items-center justify-center tracking-tight">
                      {selectedFlow.id || "New Flow"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 rtl:mr-1 rtl:ml-0">{t("notes")}</label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:border-emerald-500 outline-none transition font-medium text-slate-600 text-sm h-28 resize-none shadow-sm"
                    value={selectedFlow.description}
                    onChange={(e) => setSelectedFlow({ ...selectedFlow, description: e.target.value })}
                  />
                </div>
              </section>

              <div className="h-px bg-slate-100 mx-[-2rem]" />

              <section className="space-y-5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t("messageTemplate")}</label>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    {t("arabicOk")}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <button
                      key={v.value}
                      onClick={() => insertVariable(v.value)}
                      className="flex items-center space-x-2 rtl:space-x-reverse px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all shadow-sm"
                    >
                      <span className="text-emerald-500">{v.icon}</span>
                      <span>{v.label}</span>
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <textarea
                    ref={textAreaRef}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 min-h-[220px] focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none text-sm leading-relaxed text-slate-800 shadow-inner resize-none transition-all"
                    value={selectedFlow.template}
                    onChange={(e) => setSelectedFlow({ ...selectedFlow, template: e.target.value })}
                    dir="auto"
                  />
                  <div className={`absolute bottom-4 ${isRtl ? "left-6" : "right-6"} text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] pointer-events-none`}>
                    {selectedFlow.template.length} {t("characters")}
                  </div>
                </div>

                <div className="bg-emerald-50/20 p-6 rounded-[2rem] border border-emerald-100/50 shadow-inner">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em]">{t("livePreview")}</span>
                  </div>

                  <p className="text-sm text-emerald-950/80 whitespace-pre-wrap leading-relaxed italic">
                    {selectedFlow.template
                      .replace(/{{customer_name}}/g, "عبدالعزيز")
                      .replace(/{{order_id}}/g, "ORD-5542")
                      .replace(/{{store_name}}/g, "متجر نجد")
                      .replace(/{{cart_link}}/g, "salla.sa/checkout")}
                  </p>
                </div>
              </section>
            </div>

            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-4 shrink-0">
              <button
                onClick={handleCloseDrawer}
                className="w-full py-4 text-slate-500 font-black text-[11px] hover:text-slate-800 transition-colors uppercase tracking-[0.2em]"
              >
                {t("discard")}
              </button>

              <button
                onClick={saveChanges}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] hover:bg-emerald-700 shadow-2xl shadow-emerald-600/20 transition-all active:scale-95 uppercase tracking-[0.25em]"
              >
                {t("applyChanges")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
