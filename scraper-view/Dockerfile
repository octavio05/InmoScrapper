# Stage 1: Build the Angular application
FROM node:22-alpine AS build

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build --configuration=production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output to Nginx's html directory
COPY --from=build /app/dist/scraperView/browser /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
