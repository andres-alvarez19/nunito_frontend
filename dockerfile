# 1) STAGE DE BUILD
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos solo lo necesario primero para aprovechar caché
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* .npmrc* ./ 

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Build de Expo Web
# Ajusta el comando si tu proyecto usa otro
RUN npx expo export --platform web --output-dir dist

# 2) STAGE DE RUNTIME
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Instalamos 'serve' para servir estáticos
RUN npm install -g serve

# Copiamos el resultado del build desde el stage anterior
# Ajusta 'dist' si tu export deja la carpeta con otro nombre
COPY --from=builder /app/dist ./dist

# Railway inyecta PORT, usamos 3000 por defecto solo localmente
ENV PORT=3000

# Comando de arranque: servir la carpeta web-build
CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
