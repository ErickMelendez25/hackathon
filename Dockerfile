# Etapa de construcción
FROM node:18 AS build

WORKDIR /app

# Copia dependencias
COPY package*.json ./

# Instalar dependencias sin devDependencies
RUN npm ci --omit=dev

# Copia el resto del proyecto
COPY . .

# Forzar la recompilación de swc
RUN npm rebuild @swc/core --build-from-source

# Compilación de la app con Vite
RUN npm run build

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Instala el servidor estático
RUN npm install -g serve

# Copia el directorio dist (build) desde la etapa de construcción
COPY --from=build /app/dist /app/dist

EXPOSE 3000

CMD ["serve", "dist", "-l", "3000"]
