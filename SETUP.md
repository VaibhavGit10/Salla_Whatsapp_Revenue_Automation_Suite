# Salla WhatsApp Automation Suite - Setup Guide

## Overview
This application integrates Salla marketplace with WhatsApp Business API to automate messaging for abandoned carts, COD confirmations, and post-purchase flows.

## Architecture
- **Backend**: AppSail (Node.js/Express) - `appsail/`
- **Frontend**: React App - `react-app/`
- **Platform**: Zoho Catalyst

## Environment Variables

### Backend (AppSail)
Create environment variables in Catalyst console or `.env`:

```bash
# Salla OAuth
SALLA_CLIENT_ID=your_salla_client_id
SALLA_CLIENT_SECRET=your_salla_client_secret
SALLA_REDIRECT_URI=https://your-domain.com/salla/oauth/callback
SALLA_WEBHOOK_SECRET=your_webhook_secret

# WhatsApp/Meta
META_ACCESS_TOKEN=your_meta_access_token
META_PHONE_ID=your_phone_number_id
META_VERIFY_TOKEN=SALLAFLOW_VERIFY_HASH_9F1A

# Encryption
ENCRYPTION_KEY=your_32_byte_hex_key_or_any_string

# Frontend URL (for OAuth redirect)
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (React App)
Create `.env` file in `react-app/`:

```bash
REACT_APP_API_BASE=/api
REACT_APP_API_TARGET=http://localhost:3000
```

## Datastore Tables

The following tables need to be created in Catalyst Datastore:

1. **Stores** - Store Salla installation data
   - store_id (String)
   - store_name (String)
   - store_domain (String)
   - access_token (String, encrypted)
   - refresh_token (String, encrypted)
   - expires_at (DateTime)
   - installed_at (DateTime)
   - status (String)

2. **StoreConfigs** - WhatsApp configuration per store
   - store_id (String)
   - phone_number_id (String)
   - whatsapp_access_token (String, encrypted)
   - verify_token (String)

3. **Flows** - Automation flow configurations
   - store_id (String)
   - flow_type (String): ABANDONED_CART, COD_CONFIRMATION, POST_PURCHASE, ORDER_STATUS
   - name (String)
   - description (String)
   - status (String): active, inactive
   - template (String)
   - delay_minutes (Number)

4. **MessageLogs** - Message delivery logs
   - store_id (String)
   - customer_phone (String, encrypted)
   - customer_phone_masked (String)
   - order_id (String)
   - flow_type (String)
   - message_id (String)
   - status (String): sent, delivered, read, failed
   - template (String)
   - created_at (DateTime)

5. **Orders** - Order tracking
   - store_id (String)
   - order_id (String)
   - order_number (String)
   - customer_id (String)
   - customer_phone (String)
   - payment_method (String)
   - is_cod (Boolean)
   - status (String)
   - total (Number)
   - created_at (DateTime)

## Salla App Setup

1. Create a Salla app at https://salla.dev
2. Configure OAuth redirect URI: `https://your-domain.com/salla/oauth/callback`
3. Request scopes: `offline_access stores.orders stores.products stores.customers`
4. Configure webhook URL: `https://your-domain.com/salla/webhook`
5. Subscribe to events:
   - `order.created`
   - `order.paid`
   - `order.shipped`
   - `order.delivered`
   - `order.cancelled`
   - `cart.abandoned` (if available)

## WhatsApp Business API Setup

1. Create a Meta App at https://developers.facebook.com
2. Add WhatsApp product to your app
3. Get Phone Number ID and Access Token
4. Configure webhook URL: `https://your-domain.com/whatsapp/webhook`
5. Set verify token (use `META_VERIFY_TOKEN` from env)
6. Subscribe to webhook fields:
   - `messages`
   - `message_status`

## Installation

### Backend
```bash
cd appsail
npm install
```

### Frontend
```bash
cd react-app
npm install
```

## Running

### Development
```bash
# Backend (AppSail)
cd appsail
npm start

# Frontend
cd react-app
npm start
```

### Production
Deploy via Catalyst CLI:
```bash
catalyst-cli deploy
```

## API Endpoints

### Salla
- `GET /salla/oauth/url` - Get OAuth authorization URL
- `GET /salla/oauth/callback` - OAuth callback handler
- `POST /salla/webhook` - Salla webhook endpoint
- `GET /salla/store/:merchant/status` - Get store installation status

### WhatsApp
- `GET /whatsapp/webhook` - Webhook verification
- `POST /whatsapp/webhook` - WhatsApp webhook handler

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/flows` - Get automation flows
- `POST /dashboard/flows` - Create/update flow
- `DELETE /dashboard/flows/:id` - Delete flow
- `GET /dashboard/logs` - Get message logs
- `GET /dashboard/config` - Get store configuration
- `POST /dashboard/config` - Update store configuration

## Flow Types

1. **ABANDONED_CART** - Triggers when cart is abandoned
2. **COD_CONFIRMATION** - Sends confirmation request for COD orders
3. **POST_PURCHASE** - Review request after delivery
4. **ORDER_STATUS** - Order status notifications

## Template Variables

Available variables in message templates:
- `{{customer_name}}` - Customer first name
- `{{order_id}}` - Order ID
- `{{order_number}}` - Order number
- `{{store_name}}` - Store name
- `{{cart_link}}` - Cart checkout link

## Security Notes

- Phone numbers are encrypted at rest
- Access tokens are encrypted before storage
- Webhook signatures are verified (if configured)
- Customer phone numbers are masked in UI

## Troubleshooting

1. **OAuth not working**: Check redirect URI matches Salla app configuration
2. **Webhooks not received**: Verify webhook URL is accessible and signature verification
3. **Messages not sending**: Check WhatsApp API credentials and template approval status
4. **Store not found**: Ensure store is installed via OAuth flow
