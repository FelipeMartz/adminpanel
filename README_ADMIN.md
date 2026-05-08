# Admin Panel - KeyAuth & Discord Integration

Este proyecto es un panel de administración web premium construido con **Next.js**, **Tailwind CSS** y **KeyAuth**.

## 🚀 Características Implementadas

### 1. Autenticación Híbrida (Discord & KeyAuth)
- **Login con Discord**: Integración nativa con OAuth2.
- **Whitelist**: Sistema de seguridad que solo permite el acceso a IDs de Discord específicos configurados en el servidor.
- **Login de Respaldo**: Mantiene la opción de entrar vía KeyAuth si es necesario.

### 2. Gestión de Usuarios (Baneos)
- **Búsqueda en Tiempo Real**: Busca usuarios por nombre o licencia usando la Seller API de KeyAuth.
- **Acciones Rápidas**: Funcionalidad para banear usuarios y resetear HWID directamente desde la interfaz.
- **Estado Visual**: Indicadores de estado (Activo/Baneado) y detalles técnicos (IP, Registro, Expiración).

### 3. Sistema de Anuncios (Discord)
- **Integración Segura**: Los mensajes se envían a través de una API interna en el servidor para proteger el Webhook.
- **Personalización**: Permite configurar el título, descripción y color del 'embed' de Discord.

### 4. Diseño Premium
- **Estética Dark**: Interfaz basada en tonos oscuros, cristalografía (glassmorphism) y acentos minimalistas.
- **Sidebar de Navegación**: Acceso rápido a todas las secciones.
- **Responsivo**: Adaptable a diferentes tamaños de pantalla.

## 🛠️ Configuración (Archivo .env.local)

Para que el panel funcione, debes configurar las siguientes variables en tu archivo `.env.local`:

```env
# KeyAuth Configuration
NEXT_PUBLIC_KEYAUTH_NAME=NombreDeTuApp
NEXT_PUBLIC_KEYAUTH_OWNER=TuOwnerID
NEXT_PUBLIC_KEYAUTH_VERSION=1.0
KEYAUTH_SELLER_KEY=TuSellerKeyDeKeyAuth

# Discord Webhook
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/tu_webhook_aqui

# Discord OAuth (Para Login)
DISCORD_CLIENT_ID=TuClientID
DISCORD_CLIENT_SECRET=TuClientSecret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=un_secreto_aleatorio_seguro

# Whitelist
# Lista de IDs de Discord autorizados (separados por comas)
DISCORD_WHITELIST=1234567890,0987654321
```

## 📂 Estructura del Proyecto

- `src/app/api/`: Rutas de backend para Auth, Admin y Discord.
- `src/app/dashboard/`: Vistas principales del panel.
- `src/lib/keyauth.ts`: Clase para interactuar con la API de KeyAuth.
- `src/components/`: Componentes UI reutilizables.
