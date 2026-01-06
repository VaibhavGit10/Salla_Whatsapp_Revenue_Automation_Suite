import express from "express";
import { getDatastore } from "../datastore/client.js";
import { maskPhone } from "../utils/mask.js";

const router = express.Router();

// Get dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const storeId = req.query.store_id || req.headers["x-store-id"];
    if (!storeId) {
      return res.status(400).json({ error: "Missing store_id" });
    }

    const datastore = getDatastore(req);
    const logsTable = datastore.table("MessageLogs");
    const ordersTable = datastore.table("Orders");
    const flowsTable = datastore.table("Flows");

    // Get message stats
    const allLogs = await logsTable
      .select()
      .where("store_id", "=", storeId)
      .run();

    const sentCount = allLogs.filter(l => l.status === "sent" || l.status === "delivered" || l.status === "read").length;
    const deliveredCount = allLogs.filter(l => l.status === "delivered" || l.status === "read").length;
    const failedCount = allLogs.filter(l => l.status === "failed").length;

    // Get active flows count
    const activeFlows = await flowsTable
      .select()
      .where("store_id", "=", storeId)
      .where("status", "=", "active")
      .run();

    // Get revenue from orders (simplified - would need proper calculation)
    const orders = await ordersTable
      .select()
      .where("store_id", "=", storeId)
      .run();

    const revenue = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);

    res.json({
      total_sent: sentCount,
      delivered: deliveredCount,
      failed: failedCount,
      delivery_rate: sentCount > 0 ? ((deliveredCount / sentCount) * 100).toFixed(1) : 0,
      active_flows: activeFlows.length,
      revenue: revenue,
      abandoned_carts: allLogs.filter(l => l.flow_type === "ABANDONED_CART").length,
      cod_confirmations: allLogs.filter(l => l.flow_type === "COD_CONFIRMATION").length
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get message logs
router.get("/logs", async (req, res) => {
  try {
    const storeId = req.query.store_id || req.headers["x-store-id"];
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    if (!storeId) {
      return res.status(400).json({ error: "Missing store_id" });
    }

    const datastore = getDatastore(req);
    const logsTable = datastore.table("MessageLogs");

    const logs = await logsTable
      .select()
      .where("store_id", "=", storeId)
      .limit(limit)
      .offset(offset)
      .run();

    const formattedLogs = logs.map(log => ({
      id: log.ROWID,
      customer_phone: log.customer_phone_masked || maskPhone(log.customer_phone || ""),
      order_id: log.order_id,
      flow_type: log.flow_type,
      status: log.status,
      timestamp: log.created_at
    }));

    res.json({ logs: formattedLogs, total: logs.length });
  } catch (error) {
    console.error("Get logs error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get flows
router.get("/flows", async (req, res) => {
  try {
    const storeId = req.query.store_id || req.headers["x-store-id"];

    if (!storeId) {
      return res.status(400).json({ error: "Missing store_id" });
    }

    const datastore = getDatastore(req);
    const flowsTable = datastore.table("Flows");

    const flows = await flowsTable
      .select()
      .where("store_id", "=", storeId)
      .run();

    const formattedFlows = flows.map(flow => ({
      id: flow.ROWID,
      type: flow.flow_type,
      name: flow.name,
      description: flow.description || "",
      status: flow.status,
      template: flow.template || "",
      delayMinutes: flow.delay_minutes || 0
    }));

    res.json({ flows: formattedFlows });
  } catch (error) {
    console.error("Get flows error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update flow
router.post("/flows", async (req, res) => {
  try {
    const storeId = req.body.store_id || req.headers["x-store-id"];
    const { id, type, flow_type, name, description, status, template, delay_minutes, delayMinutes } = req.body;

    if (!storeId) {
      return res.status(400).json({ error: "Missing store_id" });
    }

    const datastore = getDatastore(req);
    const flowsTable = datastore.table("Flows");

    const flowData = {
      store_id: storeId,
      flow_type: type || flow_type,
      name: name,
      description: description || "",
      status: status || "inactive",
      template: template || "",
      delay_minutes: delay_minutes || delayMinutes || 0
    };

    let result;
    if (id && id !== "New Flow") {
      // Update existing
      const query = flowsTable.select().where("ROWID", "=", id);
      const existing = await query.run();
      
      if (existing.length > 0) {
        await flowsTable.updateRow({
          ROWID: id,
          ...flowData
        });
        result = { ...flowData, id: parseInt(id) };
      } else {
        // Create new if not found
        const inserted = await flowsTable.insertRow(flowData);
        result = { ...flowData, id: inserted.ROWID };
      }
    } else {
      // Create new
      const inserted = await flowsTable.insertRow(flowData);
      result = { ...flowData, id: inserted.ROWID };
    }

    res.json({ flow: result });
  } catch (error) {
    console.error("Save flow error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete flow
router.delete("/flows/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const datastore = getDatastore(req);
    const flowsTable = datastore.table("Flows");

    await flowsTable.deleteRow(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete flow error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get store config
router.get("/config", async (req, res) => {
  try {
    const storeId = req.query.store_id || req.headers["x-store-id"];

    if (!storeId) {
      return res.status(400).json({ error: "Missing store_id" });
    }

    const datastore = getDatastore(req);
    const configTable = datastore.table("StoreConfigs");

    const configs = await configTable
      .select()
      .where("store_id", "=", storeId)
      .run();

    if (configs.length === 0) {
      return res.json({
        phone_number_id: "",
        access_token: "",
        verify_token: process.env.META_VERIFY_TOKEN || "SALLAFLOW_VERIFY_HASH_9F1A",
        webhook_url: `${req.protocol}://${req.get("host")}/whatsapp/webhook`
      });
    }

    const config = configs[0];
    res.json({
      phone_number_id: config.phone_number_id || "",
      access_token: config.whatsapp_access_token ? "***" : "", // Don't send actual token
      verify_token: config.verify_token || process.env.META_VERIFY_TOKEN || "SALLAFLOW_VERIFY_HASH_9F1A",
      webhook_url: `${req.protocol}://${req.get("host")}/whatsapp/webhook`
    });
  } catch (error) {
    console.error("Get config error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update store config
router.post("/config", async (req, res) => {
  try {
    const storeId = req.body.store_id || req.headers["x-store-id"];
    const { phone_number_id, access_token, verify_token } = req.body;

    if (!storeId) {
      return res.status(400).json({ error: "Missing store_id" });
    }

    const datastore = getDatastore(req);
    const configTable = datastore.table("StoreConfigs");
    const { encrypt } = await import("../utils/encrypt.js");

    const configData = {
      store_id: storeId,
      phone_number_id: phone_number_id || "",
      whatsapp_access_token: access_token ? encrypt(access_token) : "",
      verify_token: verify_token || process.env.META_VERIFY_TOKEN || "SALLAFLOW_VERIFY_HASH_9F1A"
    };

    const existing = await configTable
      .select()
      .where("store_id", "=", storeId)
      .run();

    if (existing.length > 0) {
      await configTable.updateRow({
        ROWID: existing[0].ROWID,
        ...configData
      });
    } else {
      await configTable.insertRow(configData);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Update config error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
