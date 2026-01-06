import axios from "axios";
import { getDatastore } from "../datastore/client.js";
import { decrypt } from "../utils/encrypt.js";
import { maskPhone } from "../utils/mask.js";

const META_API_BASE = "https://graph.facebook.com/v18.0";

class WhatsAppService {
  async sendTemplateMessage(phoneNumberId, accessToken, to, templateName, languageCode, parameters = []) {
    try {
      const response = await axios.post(
        `${META_API_BASE}/${phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: to.replace(/\D/g, ""), // Remove non-digits
          type: "template",
          template: {
            name: templateName,
            language: {
              code: languageCode || "ar"
            },
            components: parameters.length > 0 ? [
              {
                type: "body",
                parameters: parameters.map(param => ({
                  type: typeof param === "string" ? "text" : param.type || "text",
                  text: typeof param === "string" ? param : param.value
                }))
              }
            ] : []
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0]?.id,
        data: response.data
      };
    } catch (error) {
      console.error("WhatsApp send error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  async sendInteractiveMessage(phoneNumberId, accessToken, to, bodyText, buttons) {
    try {
      const response = await axios.post(
        `${META_API_BASE}/${phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: to.replace(/\D/g, ""),
          type: "interactive",
          interactive: {
            type: "button",
            body: {
              text: bodyText
            },
            action: {
              buttons: buttons.map((btn, idx) => ({
                type: "reply",
                reply: {
                  id: btn.id || `btn_${idx}`,
                  title: btn.title
                }
              }))
            }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0]?.id,
        data: response.data
      };
    } catch (error) {
      console.error("WhatsApp interactive message error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  async logMessage(storeId, customerPhone, orderId, flowType, messageId, status, template, req) {
    const datastore = getDatastore(req);
    const table = datastore.table("MessageLogs");

    await table.insertRow({
      store_id: storeId,
      customer_phone: customerPhone, // Encrypted in real implementation
      customer_phone_masked: maskPhone(customerPhone),
      order_id: orderId || null,
      flow_type: flowType,
      message_id: messageId,
      status: status, // sent, delivered, read, failed
      template: template,
      created_at: new Date().toISOString()
    });
  }

  async getStoreWhatsAppConfig(storeId, req) {
    const datastore = getDatastore(req);
    const table = datastore.table("StoreConfigs");

    const query = table.select().where("store_id", "=", storeId);
    const result = await query.run();

    if (result.length === 0) {
      return null;
    }

    const config = result[0];
    return {
      phone_number_id: config.phone_number_id,
      access_token: decrypt(config.whatsapp_access_token),
      verify_token: config.verify_token
    };
  }
}

export const whatsappService = new WhatsAppService();
