import express from "express";
import { getDatastore } from "../datastore/client.js";
import { whatsappService } from "../services/whatsapp.service.js";

const router = express.Router();

// WhatsApp webhook for Meta
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.META_VERIFY_TOKEN || "SALLAFLOW_VERIFY_HASH_9F1A";

  if (mode === "subscribe" && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// WhatsApp webhook for receiving messages
router.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      // Handle message status updates
      if (value?.statuses) {
        const status = value.statuses[0];
        const datastore = getDatastore(req);
        const logsTable = datastore.table("MessageLogs");

        // Update message status
        const query = logsTable
          .select()
          .where("message_id", "=", status.id);
        const logs = await query.run();

        if (logs.length > 0) {
          await logsTable.updateRow({
            ROWID: logs[0].ROWID,
            status: status.status // sent, delivered, read, failed
          });
        }
      }

      // Handle incoming messages (for COD confirmation responses)
      if (value?.messages) {
        const message = value.messages[0];
        
        if (message.type === "interactive" && message.interactive?.type === "button_reply") {
          const buttonId = message.interactive.button_reply.id;
          const from = message.from;

          // Handle COD confirmation/cancellation
          if (buttonId === "confirm_cod" || buttonId === "cancel_cod") {
            // Update order status or notify merchant
            // Implementation depends on your order management
          }
        }
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
