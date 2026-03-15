# Shitter Social - Docker Setup

## Quick Start

```bash
cd shitter-social
docker-compose up -d
```

## Environment Variables

Create a `.env` file or set these before running:

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `shitter` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `changeme` |
| `POSTGRES_DB` | Database name | `shitter` |
| `MINIO_ROOT_USER` | MinIO access key | `minioadmin` |
| `MINIO_ROOT_PASSWORD` | MinIO secret key | `minioadmin` |

## Services

### PostgreSQL (port 5432)
- Database for Shitter Social application data
- Data persists in `postgres_data` volume

### MinIO (ports 9000, 9001)
- S3-compatible object storage for media uploads
- API: `http://localhost:9000`
- Console: `http://localhost:9001` (credentials from env vars)
- Data persists in `minio_data` volume

## Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (data loss!)
docker-compose down -v
```