# React App & AppSail Alignment Fixes

## Issues Fixed

### 1. API Service Alignment
- **Fixed URL construction**: Corrected the request URL building to properly handle query parameters
- **Data normalization**: Added normalization between frontend (camelCase) and backend (snake_case) data structures
- **Flow data mapping**: Ensured flow objects are properly transformed between frontend and backend formats
- **Config data mapping**: Fixed config field mapping (phoneNumberId ↔ phone_number_id, etc.)

### 2. Store ID Handling
- **Store ID initialization**: Improved store ID retrieval from URL params and localStorage
- **Store ID validation**: Added checks to prevent API calls without store ID
- **Store ID in requests**: Ensured store ID is properly sent in headers and query params

### 3. Flow Management
- **Flow save/update**: Fixed flow data structure to match backend expectations
- **Flow status toggle**: Improved status toggle to properly update backend and local state
- **Flow ID handling**: Fixed ID comparison logic for updates vs creates
- **Flow normalization**: Added proper mapping of `delayMinutes` ↔ `delay_minutes` and `type` ↔ `flow_type`

### 4. Error Handling
- **Graceful degradation**: Added try-catch blocks to prevent app crashes on API failures
- **Error messages**: Improved error handling with user-friendly messages
- **Network errors**: Added detection for network-related errors
- **Missing store ID**: Added specific handling for missing store ID errors

### 5. Data Loading
- **Conditional loading**: Only load data when store ID is available
- **Loading states**: Improved loading state management
- **Error recovery**: Added fallback values for failed API calls

### 6. Configuration
- **Config field mapping**: Fixed mapping between frontend and backend config fields
- **Token masking**: Properly handle masked tokens from backend ("***")
- **Webhook URL**: Ensure webhook URL is properly set from backend response

## Key Changes

### `react-app/src/services/api.js`
- Added data normalization for flows and config
- Fixed URL construction with query parameters
- Improved error handling
- Added store ID validation

### `react-app/src/App.js`
- Improved store ID initialization
- Fixed data loading with proper error handling
- Enhanced flow save/update logic
- Added conditional data loading based on store ID

### `react-app/src/Pages/Automations.jsx`
- Fixed flow save with proper data structure
- Improved status toggle with immediate UI feedback
- Added validation for required flow fields

### `react-app/src/Pages/Dashboard.jsx`
- Added store ID validation before loading stats
- Improved error handling for missing store ID
- Enhanced Salla auth URL loading

## Data Structure Mapping

### Flow Object
**Frontend → Backend:**
```javascript
{
  id: flow.id,
  type: flow.type,           // → flow_type
  name: flow.name,
  description: flow.description,
  status: flow.status,
  template: flow.template,
  delayMinutes: flow.delayMinutes  // → delay_minutes
}
```

**Backend → Frontend:**
```javascript
{
  id: flow.id,
  type: flow.flow_type || flow.type,
  name: flow.name,
  description: flow.description,
  status: flow.status,
  template: flow.template,
  delayMinutes: flow.delay_minutes || flow.delayMinutes
}
```

### Config Object
**Frontend → Backend:**
```javascript
{
  phone_number_id: config.phoneNumberId,
  access_token: config.accessToken,
  verify_token: config.verifyToken
}
```

**Backend → Frontend:**
```javascript
{
  phoneNumberId: config.phone_number_id,
  accessToken: config.access_token === "***" ? "" : config.access_token,
  verifyToken: config.verify_token,
  webhookUrl: config.webhook_url
}
```

## Testing Checklist

- [ ] Store ID is properly set from URL params
- [ ] Flows load correctly from backend
- [ ] Flow creation works
- [ ] Flow update works
- [ ] Flow status toggle works
- [ ] Flow deletion works
- [ ] Config loads correctly
- [ ] Config save works
- [ ] Dashboard stats load (with store ID)
- [ ] Logs load correctly
- [ ] Salla auth URL loads
- [ ] Error handling works for missing store ID
- [ ] Error handling works for network errors

## Notes

- The proxy setup (`setupProxy.js`) forwards `/api/*` requests to the backend
- Store ID is required for most dashboard operations
- All API calls include store ID in headers (`x-store-id`)
- Flow IDs from backend are numeric (ROWID), frontend handles both string and number
