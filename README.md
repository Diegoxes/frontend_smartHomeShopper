# SmartHome Shopper — Frontend

React 18 + TypeScript + Vite + TailwindCSS

## Arquitectura de API

El frontend **no llama microservicios directamente**. Todas las peticiones van al **API Gateway**, que enruta internamente a:

| Ruta `/api/*` | Microservicio destino |
|---------------|----------------------|
| `/api/auth/**`, `/api/admin/**`, `/api/platform/**` | identity-service |
| `/api/reports/**`, `/api/dashboard/executive/**` | reporting-service |
| `/api/webhook/**` | whatsapp-service |
| Resto `/api/**` | inventory-core |

## Instalación y arranque

```bash
npm install
npm start
# → http://localhost:3000
```

## Variables de entorno (`VITE_API_BASE_URL`)

| Entorno | Valor | Notas |
|---------|-------|-------|
| Dev local (sin `.env`) | — | Vite proxy: `/api` → `http://localhost:8080` |
| Docker Compose | `http://localhost:8080` | Gateway del stack microservicios |
| Kubernetes (NodePort) | `http://localhost:30080` | Gateway expuesto en el cluster |
| Producción Azure (legacy monolito) | `https://<app>.azurewebsites.net` | Ver `.env.example` |

Copia `.env.example` a `.env` si necesitas override:

```bash
cp .env.example .env
```

Ejemplo para stack Docker Compose del backend:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Ejemplo para Kubernetes local:

```env
VITE_API_BASE_URL=http://localhost:30080
```

La capa HTTP está en [`src/services/api.ts`](src/services/api.ts): concatena `VITE_API_BASE_URL` + `/api`.

## Stack completo con Docker Compose

Con el backend levantado (`docker compose -f docker-compose.microservices.yml up` en `backend_smartHomeShopper`):

- API Gateway: http://localhost:8080/api
- Frontend en el compose: http://localhost:3000 (ya configurado con `VITE_API_BASE_URL=http://localhost:8080`)

## Requisitos

- Node.js 18+
- API Gateway / backend en el puerto configurado en `VITE_API_BASE_URL`
- (Opcional) Cuenta de Twilio para WhatsApp

## Estructura del proyecto

```
src/
├── components/
├── context/
├── hooks/
├── pages/
├── services/         # api.ts — axios + gateway
├── types/
├── App.tsx
└── main.tsx
```

## Build de producción

```bash
VITE_API_BASE_URL=http://localhost:8080 npm run build
```
