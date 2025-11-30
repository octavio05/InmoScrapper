FROM mcr.microsoft.com/playwright:v1.57.0-jammy

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración
COPY package*.json tsconfig.json ./

# Instalación de dependencias
RUN npm install

# Copia el código fuente
COPY src ./src

# Comando por defecto
ARG NODE_ENV
CMD npm run start:docker:${NODE_ENV}