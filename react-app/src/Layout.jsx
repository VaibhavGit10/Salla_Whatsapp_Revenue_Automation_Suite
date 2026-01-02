import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Footer from "./Components/Footer";

export default function Layout({ language, setLanguage }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isRtl = language === "ar";

  // ✅ optional but recommended: also update document direction
  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [isRtl]);

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-slate-50 flex">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="flex-1 flex flex-col">
        <Header
          language={language}
          setLanguage={setLanguage}
          onMenuClick={() => setIsMobileOpen(true)}
        />

        <main className="flex-1 px-6 md:px-10 py-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
