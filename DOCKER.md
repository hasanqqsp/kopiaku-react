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

# Build production image
docker build --target production -t kopiaku-react:prod .
```

### Run Containers

```bash
# Development (with hot reload)
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules kopiaku-react:dev

# Production
docker run -p 80:80 kopiaku-react:prod
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

Create a `.env` file in the project root:

```bash
VITE_API_BASE_URL=http://localhost:5031/graphql
```

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
