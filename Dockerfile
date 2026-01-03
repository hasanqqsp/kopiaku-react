# Use Node.js 20 Alpine as base image for smaller size
FROM node:20-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build stage
FROM base AS build

# Accept build-time environment variables
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

ARG VITE_STATIC_QRIS_DATA
ENV VITE_STATIC_QRIS_DATA=$VITE_STATIC_QRIS_DATA

# Build the application
RUN pnpm run build

# Production stage
FROM nginx:alpine AS production

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Create a simple nginx configuration for SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    location /landingpage { \
    alias /usr/share/nginx/html/landingpage; \
    try_files $uri $uri/ /landingpage/index.html; \
    } \
    error_page 500 502 503 504 /50x.html; \
    location = /50x.html { \
    root /usr/share/nginx/html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]