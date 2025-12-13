FROM mcr.microsoft.com/playwright:v1.57.0-jammy

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración
COPY ./scraper/package*.json ./scraper/tsconfig.json ./

# Instalación de dependencias
RUN npm install -g pnpm
RUN pnpm install

# Copia el código fuente
COPY ./scraper/src ./src

# Comando por defecto
ARG NODE_ENV
CMD npm run start:docker:${NODE_ENV}