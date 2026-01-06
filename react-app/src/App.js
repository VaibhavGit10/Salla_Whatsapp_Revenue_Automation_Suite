// src/App.js
import React, { useMemo, useState, useEffect } from "react";
import { Routes, Route, Navigate, useSearchParams } from "react-router-dom";

import AppLayout from "./Layout";

import Dashboard from "./Pages/Dashboard";
import Automations from "./Pages/Automations";
import Logs from "./Pages/HistoryLogs";
import Settings from "./Pages/APISettings";

import { FlowStatus, FlowType } from "./types";
import { TRANSLATIONS } from "./i18n/translations";
import { apiService } from "./services/api";

export default function App() {
  const [language, setLanguage] = useState("en");
  const [searchParams] = useSearchParams();
  const [flows, setFlows] = useState([]);
  const [logs, setLogs] = useState([]);
  const [config, setConfig] = useState({
    phoneNumberId: "",
    accessToken: "",
    verifyToken: "",
    webhookUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [sallaInstalled, setSallaInstalled] = useState(false);

  const t = useMemo(() => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return (key) => dict[key] ?? key;
  }, [language]);

  // Initialize store ID from URL params
  useEffect(() => {
    const storeId = searchParams.get("store_id");
    const merchant = searchParams.get("merchant");
    if (storeId) {
      apiService.setStoreId(storeId);
    } else if (merchant) {
      apiService.setStoreId(merchant);
    }

    // Check if Salla was just installed
    if (searchParams.get("salla_installed") === "true") {
      setSallaInstalled(true);
      // Remove from URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Refresh store ID
        const storeId = apiService.getStoreId();
        if (!storeId) {
          setLoading(false);
          return;
        }

        const [flowsData, logsData, configData] = await Promise.all([
          apiService.getFlows().catch((err) => {
            console.warn("Failed to load flows:", err);
            return [];
          }),
          apiService.getLogs().catch((err) => {
            console.warn("Failed to load logs:", err);
            return [];
          }),
          apiService.getConfig().catch((err) => {
            console.warn("Failed to load config:", err);
            return {
              phoneNumberId: "",
              accessToken: "",
              verifyToken: "",
              webhookUrl: "",
            };
          }),
        ]);

        setFlows(flowsData);
        setLogs(logsData);
        setConfig(configData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Small delay to ensure store ID is set
    const timer = setTimeout(loadData, 100);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleSaveFlow = async (flow) => {
    try {
      const saved = await apiService.saveFlow(flow);
      setFlows((prev) => {
        const existing = prev.find((f) => f.id === saved.id || f.id === flow.id);
        if (existing) {
          return prev.map((f) => (f.id === saved.id || f.id === flow.id ? saved : f));
        }
        return [...prev, saved];
      });
      return saved;
    } catch (error) {
      console.error("Failed to save flow:", error);
      throw error;
    }
  };

  const handleDeleteFlow = async (flowId) => {
    try {
      await apiService.deleteFlow(flowId);
      setFlows((prev) => prev.filter((f) => f.id !== flowId));
    } catch (error) {
      console.error("Failed to delete flow:", error);
      throw error;
    }
  };

  const handleSaveConfig = async (newConfig) => {
    try {
      await apiService.saveConfig(newConfig);
      setConfig(newConfig);
    } catch (error) {
      console.error("Failed to save config:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<AppLayout language={language} setLanguage={setLanguage} />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route
          path="dashboard"
          element={
            <Dashboard
              language={language}
              t={t}
              sallaInstalled={sallaInstalled}
              setSallaInstalled={setSallaInstalled}
            />
          }
        />

        <Route
          path="flows"
          element={
            <Automations
              flows={flows}
              onSaveFlow={handleSaveFlow}
              onDeleteFlow={handleDeleteFlow}
              language={language}
              t={t}
            />
          }
        />

        <Route
          path="logs"
          element={
            <Logs
              logs={logs}
              onRefresh={() => apiService.getLogs().then(setLogs)}
              language={language}
              t={t}
            />
          }
        />

        <Route
          path="settings"
          element={
            <Settings
              config={config}
              onSaveConfig={handleSaveConfig}
              language={language}
              t={t}
            />
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
