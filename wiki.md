# Project Wiki - BAID System

Welcome to the BAID System Wiki. This document provides deep technical details on how the system architecture works and how to extend it.

## 🏗️ Architecture

The system consists of three main parts:
1. **Web Dashboard**: Next.js application for administrators.
2. **REST API**: Secure endpoints for communication.
3. **Client Loader**: C# or C++ application used by end-users.

---

## 🔌 API Endpoints Reference

### Public Endpoints
These endpoints are used by the client loader.

#### 1. Check Update / Ban Status
`GET /api/check-update`
- **Purpose**: Checks for the latest version and verifies if the user's IP is banned.
- **Response (Success)**: 
  ```json
  { "version": "1.0.1", "url": "/downloads/baid.exe", "timestamp": "..." }
  ```
- **Response (Banned)**: Returns `403 Forbidden`
  ```json
  { "banned": true, "message": "Reason for ban" }
  ```

#### 2. Presence Heartbeat
`GET /api/presence?username=USER_NAME`
- **Purpose**: Registers that a user is currently using the application.
- **Frequency**: Recommended every 10 seconds.
- **Data Storage**: Saved in `public/downloads/presence.json`.

---

### Admin Endpoints
These require an active session (protected by NextAuth).

#### 1. File Upload
`POST /api/upload`
- **Form Data**: `file` (the .exe), `version` (string).
- **Behavior**: Saves the file as `baid.exe` and updates `history.json`.

#### 2. IP Ban Management
`POST /api/admin/ban-ip`
- **Body**: `{ "ip": "...", "action": "ban/unban", "reason": "..." }`

---

## 🛡️ Security Model

### Authentication
- **Admin**: Logged in via Discord. Only IDs in `DISCORD_WHITELIST` can access the dashboard.
- **Client**: KeyAuth handles license verification, while our API handles IP-level restrictions.

### Data Storage
Currently, the system uses JSON files for persistence to remain lightweight and easy to deploy (Vercel/Self-hosted).
- `history.json`: List of all versions.
- `banned_ips.json`: List of blocked IPs and reasons.
- `presence.json`: Temporary cache of online users.

---

## 🔧 Troubleshooting

### "File in Use" error in C#
Ensure that the loader closes any existing `baid.exe` processes before attempting to overwrite the file. The provided C# example includes logic for this using `Process.GetProcessesByName`.

### IP detected as `127.0.0.1` or `::1`
When running locally, your IP will always show as the loopback address. In production, the system correctly extracts the IP from `X-Forwarded-For` or `X-Real-IP` headers.

---

## 📈 Future Roadmap
- [ ] Database integration (MongoDB/PostgreSQL).
- [ ] File encryption for updates.
- [ ] Discord Webhook notifications for every new update.
- [ ] Advanced analytics dashboard.
