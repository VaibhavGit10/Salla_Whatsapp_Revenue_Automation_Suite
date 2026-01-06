import express from "express";
import { getDatastore } from "../datastore/client.js";
import { encrypt } from "../utils/encrypt.js";
import { sallaService } from "../services/salla.service.js";

const router = express.Router();

// Salla OAuth callback - handles installation
router.get("/oauth/callback", async (req, res) => {
  try {
    const { code, merchant } = req.query;

    if (!code || !merchant) {
      return res.status(400).json({ error: "Missing code or merchant parameter" });
    }

    // Exchange code for access token
    const tokenData = await sallaService.exchangeCodeForToken(code);
    
    if (!tokenData.access_token) {
      return res.status(400).json({ error: "Failed to get access token" });
    }

    // Get store information
    const storeInfo = await sallaService.getStoreInfo(tokenData.access_token);

    // Store credentials in datastore
    const datastore = getDatastore(req);
    const table = datastore.table("Stores");

    const storeData = {
      store_id: merchant,
      store_name: storeInfo.data.name || "Unknown Store",
      store_domain: storeInfo.data.domain || "",
      access_token: encrypt(tokenData.access_token),
      refresh_token: encrypt(tokenData.refresh_token || ""),
      expires_at: tokenData.expires_at || null,
      installed_at: new Date().toISOString(),
      status: "active"
    };

    await table.insertRow(storeData);

    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/settings?salla_installed=true`);
  } catch (error) {
    console.error("Salla OAuth error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Salla webhook endpoint
router.post("/webhook", async (req, res) => {
  try {
    const event = req.body;
    const signature = req.headers["x-salla-signature"];

    // Verify webhook signature if configured
    if (process.env.SALLA_WEBHOOK_SECRET) {
      const isValid = sallaService.verifyWebhookSignature(
        JSON.stringify(event),
        signature,
        process.env.SALLA_WEBHOOK_SECRET
      );
      if (!isValid) {
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    // Get store from event
    const merchant = event.merchant || event.store?.merchant;
    if (!merchant) {
      return res.status(400).json({ error: "Missing merchant identifier" });
    }

    // Process webhook event
    await sallaService.processWebhookEvent(merchant, event, req);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Salla webhook error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get store installation status
router.get("/store/:merchant/status", async (req, res) => {
  try {
    const { merchant } = req.params;
    const datastore = getDatastore(req);
    const table = datastore.table("Stores");

    const query = table.select().where("store_id", "=", merchant);
    const result = await query.run();

    if (result.length === 0) {
      return res.json({ installed: false });
    }

    const store = result[0];
    res.json({
      installed: true,
      store_name: store.store_name,
      store_domain: store.store_domain,
      installed_at: store.installed_at,
      status: store.status
    });
  } catch (error) {
    console.error("Get store status error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get Salla OAuth URL
router.get("/oauth/url", (req, res) => {
  const clientId = process.env.SALLA_CLIENT_ID;
  const redirectUri = process.env.SALLA_REDIRECT_URI || `${req.protocol}://${req.get("host")}/salla/oauth/callback`;
  const scopes = "offline_access stores.orders stores.products stores.customers";

  const authUrl = `https://accounts.salla.sa/oauth2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}`;

  res.json({ auth_url: authUrl });
});

export default router;
