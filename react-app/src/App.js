// src/App.js
import React, { useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./Layout";

import Dashboard from "./Pages/Dashboard";
import Automations from "./Pages/Automations";
import Logs from "./Pages/HistoryLogs";
import Settings from "./Pages/APISettings";

import { FlowStatus, FlowType } from "./types";
import { TRANSLATIONS } from "./i18n/translations";

export default function App() {
  const [language, setLanguage] = useState("en");

  const t = useMemo(() => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return (key) => dict[key] ?? key;
  }, [language]);

  const [flows, setFlows] = useState([
    {
      id: "flow_abandoned",
      type: FlowType.ABANDONED_CART,
      name: "Abandoned Cart Recovery",
      description: "Recover abandoned carts automatically.",
      status: FlowStatus.ACTIVE,
      template:
        "Hi {{customer_name}}, your cart is waiting in {{store_name}}. {{cart_link}}",
      delayMinutes: 15,
    },
    {
      id: "flow_cod",
      type: FlowType.COD_CONFIRMATION,
      name: "COD Confirmation",
      description: "Confirm COD orders before shipping.",
      status: FlowStatus.ACTIVE,
      template:
        "Hello {{customer_name}}, confirm COD order {{order_id}} from {{store_name}}.",
      delayMinutes: 5,
    },
  ]);

  const [logs] = useState([
    {
      id: "log1",
      customerPhone: "+966 5X XXX XXXX",
      orderId: "ORD-5542",
      flowType: "ABANDONED_CART",
      status: "delivered",
      timestamp: "Today 12:40 PM",
    },
    {
      id: "log2",
      customerPhone: "+966 5X XXX XXXX",
      orderId: "ORD-7811",
      flowType: "COD_CONFIRMATION",
      status: "read",
      timestamp: "Today 09:15 AM",
    },
  ]);

  const [config, setConfig] = useState({
    phoneNumberId: "1234567890",
    accessToken: "EAAGxxxxxxxxxxxxxxxxxxxxx",
    verifyToken: "SALLAFLOW_VERIFY_HASH_9F1A",
    webhookUrl: "https://your-gateway-domain.com/webhooks/meta",
  });

  return (
    <Routes>
      <Route
        path="/"
        element={<AppLayout language={language} setLanguage={setLanguage} />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard language={language} t={t} />} />

        <Route
          path="flows"
          element={
            <Automations
              flows={flows}
              setFlows={setFlows}
              language={language}
              t={t}
            />
          }
        />

        <Route path="logs" element={<Logs logs={logs} language={language} t={t} />} />

        <Route
          path="settings"
          element={
            <Settings
              config={config}
              setConfig={setConfig}
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
