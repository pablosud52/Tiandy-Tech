# Dockerfile para Tiandy Tech (Producción NAS)
# Multi-stage build para imagen liviana y de arranque rápido

FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci --omit=dev=false

# Copiar código fuente
COPY . .

# Compilar frontend (Vite) y backend (TypeScript)
RUN npm run build

# Etapa final de producción
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=1030

# Copiar package.json e instalar solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar dist compilado y archivos necesarios
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/02-DOCS/datasheets-ejemplo ./02-DOCS/datasheets-ejemplo

# Crear directorio de datos persistente
RUN mkdir -p /app/data/docs /app/data/img

# Puerto oficial para NAS
EXPOSE 1030

# Comando de inicio
CMD ["node", "dist/server/index.js"]
