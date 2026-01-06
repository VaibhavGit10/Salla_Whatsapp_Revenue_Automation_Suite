// Error handling utilities
export function handleApiError(error, defaultMessage = "An error occurred") {
  if (error.message) {
    if (error.message.includes("Missing store_id")) {
      return "Store not connected. Please install Salla app first.";
    }
    if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      return "Authentication failed. Please check your credentials.";
    }
    if (error.message.includes("404")) {
      return "Resource not found.";
    }
    if (error.message.includes("500")) {
      return "Server error. Please try again later.";
    }
    return error.message;
  }
  return defaultMessage;
}

export function isNetworkError(error) {
  return error.message && (
    error.message.includes("Failed to fetch") ||
    error.message.includes("NetworkError") ||
    error.message.includes("Network request failed")
  );
}
