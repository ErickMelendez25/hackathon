# Etapa de construcción
FROM node:18 AS build

WORKDIR /app

# Copia dependencias
COPY package*.json ./

# Instalación limpia
RUN npm ci

# Copia resto del proyecto
COPY . .

# ⚠️ Forzar recompilación de swc para evitar errores
RUN npm rebuild @swc/core --build-from-source

# Compila la app con Vite
RUN npm run build

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Instala un servidor simple
RUN npm install -g serve

# Copia build final
COPY --from=build /app/dist /app/dist

EXPOSE 3000

CMD ["serve", "dist", "-l", "3000"]
