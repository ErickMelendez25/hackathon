# Etapa de construcción
FROM node:18 AS build

WORKDIR /app

# Copiamos package.json y lock
COPY package*.json ./

# Instalación limpia y confiable
RUN npm ci

# Copiamos el resto del código
COPY . .

# ⚠️ Recompilamos @swc/core para que funcione en entorno Docker/Railway
RUN npm rebuild @swc/core --build-from-source

# Build de la app
RUN npm run build

# Etapa de ejecución
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist /app/dist

EXPOSE 3000

CMD ["serve", "dist", "-l", "3000"]
