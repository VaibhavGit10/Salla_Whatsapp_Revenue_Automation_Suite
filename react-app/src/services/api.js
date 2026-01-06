// API service for connecting React app to backend
const API_BASE = process.env.REACT_APP_API_BASE || "/api";

class ApiService {
  constructor() {
    this.storeId = this.getStoreId();
  }

  getStoreId() {
    // Get store ID from localStorage or URL params
    const params = new URLSearchParams(window.location.search);
    return params.get("store_id") || localStorage.getItem("store_id") || "";
  }

  setStoreId(storeId) {
    this.storeId = storeId;
    localStorage.setItem("store_id", storeId);
  }

  async request(endpoint, options = {}) {
    let url = `${API_BASE}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(this.storeId && { "x-store-id": this.storeId }),
      ...options.headers
    };

    // Add store_id to query params if not in body and endpoint needs it
    const needsStoreId = endpoint.includes("/dashboard/") || endpoint.includes("/salla/store/");
    if (needsStoreId && this.storeId && !options.body) {
      const separator = endpoint.includes("?") ? "&" : "?";
      url = `${API_BASE}${endpoint}${separator}store_id=${encodeURIComponent(this.storeId)}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Salla integration
  async getSallaAuthUrl() {
    try {
      const response = await this.request("/salla/oauth/url");
      return response.auth_url;
    } catch (error) {
      console.warn("Failed to get Salla auth URL:", error);
      return "";
    }
  }

  async getSallaStatus(merchant) {
    return this.request(`/salla/store/${merchant}/status`);
  }

  // Dashboard
  async getDashboardStats() {
    return this.request("/dashboard/stats");
  }

  // Flows
  async getFlows() {
    const response = await this.request("/dashboard/flows");
    const flows = response.flows || [];
    // Normalize flow data structure
    return flows.map(flow => ({
      id: flow.id,
      type: flow.type || flow.flow_type,
      name: flow.name,
      description: flow.description || "",
      status: flow.status,
      template: flow.template || "",
      delayMinutes: flow.delayMinutes || flow.delay_minutes || 0
    }));
  }

  async saveFlow(flow) {
    // Normalize flow data to match backend expectations
    const flowData = {
      id: flow.id,
      type: flow.type || flow.flow_type,
      name: flow.name,
      description: flow.description || "",
      status: flow.status || "inactive",
      template: flow.template || "",
      delay_minutes: flow.delayMinutes || flow.delay_minutes || 0,
      store_id: this.storeId
    };

    const response = await this.request("/dashboard/flows", {
      method: "POST",
      body: JSON.stringify(flowData)
    });
    
    // Normalize response to match frontend expectations
    const savedFlow = response.flow || response;
    return {
      id: savedFlow.id,
      type: savedFlow.flow_type || savedFlow.type,
      name: savedFlow.name,
      description: savedFlow.description || "",
      status: savedFlow.status,
      template: savedFlow.template || "",
      delayMinutes: savedFlow.delay_minutes || savedFlow.delayMinutes || 0
    };
  }

  async deleteFlow(flowId) {
    return this.request(`/dashboard/flows/${flowId}`, {
      method: "DELETE"
    });
  }

  // Logs
  async getLogs(limit = 50, offset = 0) {
    const response = await this.request(`/dashboard/logs?limit=${limit}&offset=${offset}`);
    return response.logs || [];
  }

  // Config
  async getConfig() {
    const config = await this.request("/dashboard/config");
    // Normalize config data structure
    return {
      phoneNumberId: config.phone_number_id || config.phoneNumberId || "",
      accessToken: config.access_token === "***" ? "" : (config.access_token || ""),
      verifyToken: config.verify_token || config.verifyToken || "",
      webhookUrl: config.webhook_url || config.webhookUrl || ""
    };
  }

  async saveConfig(config) {
    return this.request("/dashboard/config", {
      method: "POST",
      body: JSON.stringify({
        phone_number_id: config.phoneNumberId,
        access_token: config.accessToken,
        verify_token: config.verifyToken,
        store_id: this.storeId
      })
    });
  }
}

export const apiService = new ApiService();
