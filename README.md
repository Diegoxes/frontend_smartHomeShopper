# SmartHome Shopper — Frontend

React 18 + TypeScript + Vite + TailwindCSS

## Estructura del proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── AdjustModal.tsx
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProductModal.tsx
│   ├── Sidebar.tsx
│   └── StatCard.tsx
├── context/          # Context API (auth global)
│   └── AuthContext.tsx
├── hooks/            # Custom hooks (React Query)
│   ├── useDashboard.ts
│   └── useProducts.ts
├── pages/            # Vistas / pantallas
│   ├── AlertsPage.tsx
│   ├── AuthPage.tsx
│   ├── DashboardPage.tsx
│   ├── InventoryPage.tsx
│   ├── StatsPage.tsx
│   └── WhatsAppPage.tsx
├── services/         # Capa de API (axios)
│   └── api.ts
├── types/            # Tipos TypeScript compartidos
│   └── index.ts
├── App.tsx
├── index.css
└── main.tsx
```

## Instalación y arranque

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar en desarrollo
npm start
# → abre http://localhost:3000

# 3. Build de producción
npm run build
```

## Requisitos

- Node.js 18+
- Backend Spring Boot corriendo en http://localhost:8080
- (Opcional) Cuenta de Twilio para WhatsApp

## Variables de entorno

El proxy de Vite redirige `/api` → `http://localhost:8080`.
Si tu backend corre en otro puerto, edita `vite.config.ts`.
