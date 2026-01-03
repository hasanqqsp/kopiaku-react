# Docker Setup for Kopiaku React

This project includes Docker configuration for both development and production environments.

## Quick Start

### Development

```bash
# Run development server
docker-compose --profile dev up

# Or build and run manually
docker build --target development -t kopiaku-dev .
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules kopiaku-dev
```

### Production

```bash
# Run production build
docker-compose --profile prod up

# Or build and run manually
docker build --target production -t kopiaku-prod .
docker run -p 80:80 kopiaku-prod
```

### Build Only

```bash
# Just build the application
docker-compose --profile build up
```

## Docker Commands

### Build Images

```bash
# Build development image
docker build --target development -t kopiaku-react:dev .

# Build production image with build args
docker build --target production --build-arg VITE_API_BASE_URL=http://localhost:5031/graphql -t kopiaku-react:prod .
```

### Run Containers

```bash
# Development (with environment variables)
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules \
  -e VITE_API_BASE_URL=http://localhost:5031/graphql \
  kopiaku-react:dev

# Production (environment variables baked into build)
docker run -p 80:80 kopiaku-react:prod

# Alternative: Export env vars first
export VITE_API_BASE_URL=http://localhost:5031/graphql
docker run -p 5173:5173 -e VITE_API_BASE_URL kopiaku-react:dev
```

### Clean Up

```bash
# Remove containers
docker-compose down

# Remove images
docker rmi kopiaku-react:dev kopiaku-react:prod

# Clean up everything
docker system prune -a
```

## Environment Variables

**System Environment Variables**: This setup uses environment variables from the system rather than `.env` files.

### Set Environment Variables

```bash
# Export environment variables in your shell
export VITE_API_BASE_URL=http://localhost:5031/graphql

# Or use a .env file for docker-compose (optional)
echo "VITE_API_BASE_URL=http://localhost:5031/graphql" > .env
```

### How Environment Variables Work

- **Development**: Environment variables are passed directly to the container at runtime
- **Build**: Build arguments (`ARG`) are used to pass variables during image build
- **Production**: Environment variables are baked into the static files during build

### Environment Variable Sources

1. **System environment**: `export VITE_API_BASE_URL=...`
2. **Docker Compose**: Set in `docker-compose.yml` environment section
3. **Docker run**: `docker run -e VITE_API_BASE_URL=...`
4. **Build args**: Passed during `docker build --build-arg VITE_API_BASE_URL=...`

## Nginx Configuration

The production build uses Nginx with:

- SPA routing support (try_files for client-side routing)
- Static file serving
- Gzip compression
- Custom landingpage route handling

## Multi-Stage Build Benefits

1. **Development Stage**: Includes development dependencies and hot reload
2. **Build Stage**: Optimized build process
3. **Production Stage**: Minimal nginx-based image for production

## Port Mapping

- **Development**: `5173` (Vite dev server)
- **Production**: `80` (Nginx)

## Volume Mounts (Development)

- Source code: `./:/app` (for hot reload)
- Node modules: `/app/node_modules` (performance optimization)
