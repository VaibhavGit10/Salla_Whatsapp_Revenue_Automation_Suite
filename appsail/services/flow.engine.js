import { getDatastore } from "../datastore/client.js";
import { whatsappService } from "./whatsapp.service.js";
import { sallaService } from "./salla.service.js";

class FlowEngine {
  async handleOrderCreated(merchant, orderData, accessToken, req) {
    const datastore = getDatastore(req);
    const flowsTable = datastore.table("Flows");
    const ordersTable = datastore.table("Orders");

    // Get order details
    const order = await sallaService.getOrder(accessToken, orderData.id);
    const orderInfo = order.data;

    // Store order
    await ordersTable.insertRow({
      store_id: merchant,
      order_id: orderInfo.id.toString(),
      order_number: orderInfo.order_number || "",
      customer_id: orderInfo.customer?.id?.toString() || null,
      customer_phone: orderInfo.customer?.mobile || null,
      payment_method: orderInfo.payment_method?.name || "",
      is_cod: orderInfo.payment_method?.name?.toLowerCase().includes("cod") || false,
      status: orderInfo.status || "pending",
      total: orderInfo.total?.amount || 0,
      created_at: orderInfo.created_at || new Date().toISOString()
    });

    // Check if COD confirmation flow is active
    if (orderInfo.payment_method?.name?.toLowerCase().includes("cod")) {
      const codFlows = await flowsTable
        .select()
        .where("store_id", "=", merchant)
        .where("flow_type", "=", "COD_CONFIRMATION")
        .where("status", "=", "active")
        .run();

      if (codFlows.length > 0) {
        const flow = codFlows[0];
        await this.triggerFlow(merchant, flow, {
          order_id: orderInfo.id.toString(),
          order_number: orderInfo.order_number || "",
          customer_name: orderInfo.customer?.first_name || "Customer",
          customer_phone: orderInfo.customer?.mobile,
          store_name: orderInfo.store?.name || "Store"
        }, req);
      }
    }
  }

  async handleOrderPaid(merchant, orderData, accessToken, req) {
    // Stop abandoned cart flows if order is paid
    await this.cancelAbandonedCartFlows(merchant, orderData.id.toString(), req);
  }

  async handleOrderShipped(merchant, orderData, accessToken, req) {
    // Could trigger shipping notification flow
  }

  async handleOrderDelivered(merchant, orderData, accessToken, req) {
    const datastore = getDatastore(req);
    const flowsTable = datastore.table("Flows");

    // Check for post-purchase review flow
    const reviewFlows = await flowsTable
      .select()
      .where("store_id", "=", merchant)
      .where("flow_type", "=", "POST_PURCHASE")
      .where("status", "=", "active")
      .run();

    if (reviewFlows.length > 0) {
      const flow = reviewFlows[0];
      // Schedule review request after delay
      const delayMs = (flow.delay_minutes || 24 * 60) * 60 * 1000;
      setTimeout(async () => {
        const order = await sallaService.getOrder(accessToken, orderData.id);
        const orderInfo = order.data;
        
        await this.triggerFlow(merchant, flow, {
          order_id: orderInfo.id.toString(),
          order_number: orderInfo.order_number || "",
          customer_name: orderInfo.customer?.first_name || "Customer",
          customer_phone: orderInfo.customer?.mobile,
          store_name: orderInfo.store?.name || "Store"
        }, req);
      }, delayMs);
    }
  }

  async handleOrderCancelled(merchant, orderData, accessToken, req) {
    // Cancel any pending flows for this order
    await this.cancelAbandonedCartFlows(merchant, orderData.id.toString(), req);
  }

  async handleAbandonedCart(merchant, cartData, accessToken, req) {
    const datastore = getDatastore(req);
    const flowsTable = datastore.table("Flows");

    // Get active abandoned cart flows
    const flows = await flowsTable
      .select()
      .where("store_id", "=", merchant)
      .where("flow_type", "=", "ABANDONED_CART")
      .where("status", "=", "active")
      .run();

    if (flows.length > 0) {
      const flow = flows[0];
      await this.triggerFlow(merchant, flow, {
        customer_name: cartData.customer?.first_name || "Customer",
        customer_phone: cartData.customer?.mobile,
        store_name: cartData.store?.name || "Store",
        cart_link: cartData.cart_url || ""
      }, req);
    }
  }

  async triggerFlow(merchant, flow, variables, req) {
    const whatsappConfig = await whatsappService.getStoreWhatsAppConfig(merchant, req);
    
    if (!whatsappConfig || !variables.customer_phone) {
      console.warn(`Cannot trigger flow: missing config or phone for store ${merchant}`);
      return;
    }

    // Replace template variables
    let messageText = flow.template || "";
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, "g");
      messageText = messageText.replace(regex, variables[key] || "");
    });

    // For COD confirmation, send interactive message
    if (flow.flow_type === "COD_CONFIRMATION") {
      const result = await whatsappService.sendInteractiveMessage(
        whatsappConfig.phone_number_id,
        whatsappConfig.access_token,
        variables.customer_phone,
        messageText,
        [
          { id: "confirm_cod", title: "تأكيد" },
          { id: "cancel_cod", title: "إلغاء" }
        ]
      );

      await whatsappService.logMessage(
        merchant,
        variables.customer_phone,
        variables.order_id,
        flow.flow_type,
        result.messageId,
        result.success ? "sent" : "failed",
        messageText,
        req
      );
    } else {
      // Send as template message (requires pre-approved template)
      // For MVP, we'll use a generic template name
      const result = await whatsappService.sendTemplateMessage(
        whatsappConfig.phone_number_id,
        whatsappConfig.access_token,
        variables.customer_phone,
        "salla_notification", // This should be configured per store
        "ar",
        [messageText]
      );

      await whatsappService.logMessage(
        merchant,
        variables.customer_phone,
        variables.order_id,
        flow.flow_type,
        result.messageId,
        result.success ? "sent" : "failed",
        messageText,
        req
      );
    }
  }

  async cancelAbandonedCartFlows(merchant, orderId, req) {
    // Cancel any scheduled abandoned cart messages for this order
    // Implementation depends on how you schedule messages
  }
}

export const flowEngine = new FlowEngine();
