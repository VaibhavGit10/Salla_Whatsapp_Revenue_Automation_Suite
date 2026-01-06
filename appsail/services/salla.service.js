import axios from "axios";
import crypto from "crypto";
import { getDatastore } from "../datastore/client.js";
import { decrypt } from "../utils/encrypt.js";
import { flowEngine } from "./flow.engine.js";

const SALLA_API_BASE = "https://api.salla.dev/admin/v2";

class SallaService {
  async exchangeCodeForToken(code) {
    const clientId = process.env.SALLA_CLIENT_ID;
    const clientSecret = process.env.SALLA_CLIENT_SECRET;
    const redirectUri = process.env.SALLA_REDIRECT_URI;

    const response = await axios.post("https://accounts.salla.sa/oauth2/token", {
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri
    });

    return response.data;
  }

  async refreshAccessToken(refreshToken) {
    const clientId = process.env.SALLA_CLIENT_ID;
    const clientSecret = process.env.SALLA_CLIENT_SECRET;

    const response = await axios.post("https://accounts.salla.sa/oauth2/token", {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    });

    return response.data;
  }

  async getStoreInfo(accessToken) {
    const response = await axios.get(`${SALLA_API_BASE}/store`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data;
  }

  async getOrder(accessToken, orderId) {
    const response = await axios.get(`${SALLA_API_BASE}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data;
  }

  async getCustomer(accessToken, customerId) {
    const response = await axios.get(`${SALLA_API_BASE}/customers/${customerId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data;
  }

  verifyWebhookSignature(payload, signature, secret) {
    if (!signature || !secret) return true; // Skip if not configured

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  async processWebhookEvent(merchant, event, req) {
    const datastore = getDatastore(req);
    const storesTable = datastore.table("Stores");
    const logsTable = datastore.table("MessageLogs");

    // Get store credentials
    const storeQuery = storesTable.select().where("store_id", "=", merchant);
    const stores = await storeQuery.run();

    if (stores.length === 0) {
      console.warn(`Store ${merchant} not found`);
      return;
    }

    const store = stores[0];
    let accessToken = decrypt(store.access_token);

    // Check if token needs refresh
    if (store.expires_at && new Date(store.expires_at) < new Date()) {
      const refreshToken = decrypt(store.refresh_token);
      const newTokenData = await this.refreshAccessToken(refreshToken);
      accessToken = newTokenData.access_token;

      // Update store with new token
      await storesTable.updateRow({
        ROWID: store.ROWID,
        access_token: encrypt(newTokenData.access_token),
        refresh_token: encrypt(newTokenData.refresh_token || refreshToken),
        expires_at: newTokenData.expires_at || null
      });
    }

    // Log webhook event
    await logsTable.insertRow({
      store_id: merchant,
      event_type: event.event || "unknown",
      event_data: JSON.stringify(event),
      created_at: new Date().toISOString()
    });

    // Process based on event type
    const eventType = event.event;

    if (eventType === "order.created") {
      await flowEngine.handleOrderCreated(merchant, event.data, accessToken, req);
    } else if (eventType === "order.paid") {
      await flowEngine.handleOrderPaid(merchant, event.data, accessToken, req);
    } else if (eventType === "order.shipped") {
      await flowEngine.handleOrderShipped(merchant, event.data, accessToken, req);
    } else if (eventType === "order.delivered") {
      await flowEngine.handleOrderDelivered(merchant, event.data, accessToken, req);
    } else if (eventType === "order.cancelled") {
      await flowEngine.handleOrderCancelled(merchant, event.data, accessToken, req);
    } else if (eventType === "cart.abandoned") {
      await flowEngine.handleAbandonedCart(merchant, event.data, accessToken, req);
    }
  }
}

export const sallaService = new SallaService();
