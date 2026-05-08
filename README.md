# BAID Admin Dashboard & Updater System

A premium, high-performance administration panel built with **Next.js 14**, **Tailwind CSS**, and **KeyAuth Integration**. This system provides a robust solution for managing software updates, user presence, and security (IP bans).

![Dashboard Preview](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000)

## 🚀 Features

- **Live Updater**: Upload `.exe` files and push updates to your users instantly.
- **User Presence**: Real-time "Online" status tracking via 10-second heartbeats.
- **Advanced Security**: 
  - Manage IP bans with custom reasons.
  - Automatic detection and blocking of banned users in the loader.
- **User Management**: Complete control over your KeyAuth users (Ban, Reset HWID, Expiry management).
- **Glassmorphic UI**: Sleek, modern design with animations and dark mode support.
- **Developer API**: Easy-to-use endpoints for C++/C# integration.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js (Discord OAuth) & KeyAuth
- **Icons**: Lucide React
- **Animations**: Framer Motion / Tailwind Animate

## 📦 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/FelipeMartz/adminpanel.git
   cd adminpanel
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file with the following keys:
   ```env
   NEXT_PUBLIC_KEYAUTH_NAME=YourAppName
   NEXT_PUBLIC_KEYAUTH_OWNER=YourOwnerID
   KEYAUTH_SELLER_KEY=YourSellerKey
   DISCORD_CLIENT_ID=...
   DISCORD_CLIENT_SECRET=...
   NEXTAUTH_SECRET=...
   DISCORD_WHITELIST=YourDiscordID
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 📖 Documentation

For detailed integration guides (C++ and C#), check out:
- [C++ Integration Guide](tutorial.md)
- [C# Loader Example](appexample/program.cs)
- [Project Wiki](wiki.md)

## 🛡️ Security

This system implements IP-level banning that works alongside KeyAuth's native user banning. When a user is banned via IP, the loader receives a `403 Forbidden` response with the specific reason, preventing any further interaction with the software.

## 📄 License

This project is licensed under the MIT License.
