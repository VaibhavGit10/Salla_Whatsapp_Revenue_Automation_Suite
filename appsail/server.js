import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import sallaRoutes from "./routes/salla.routes.js";
import whatsappRoutes from "./routes/whatsapp.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

export function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.use("/health", healthRoutes);
  app.use("/salla", sallaRoutes);
  app.use("/whatsapp", whatsappRoutes);
  app.use("/dashboard", dashboardRoutes);

  const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT;
  if (!PORT) throw new Error("X_ZOHO_CATALYST_LISTEN_PORT not provided by AppSail");

  app.listen(PORT, () => {
    console.log(`🚀 AppSail listening on port ${PORT}`);
  });
}
