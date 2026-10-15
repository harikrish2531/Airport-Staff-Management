# ==============================================================
# AeroOps - Airport Ground Staff Management Platform
# Production Multi-Stage Ready-To-Deploy Dockerfile
# ==============================================================

# STAGE 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /build

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy source and build static bundle
COPY frontend/ ./
RUN npm run build

# STAGE 2: Python Backend & Production Static Server
FROM python:3.12-slim AS runner
WORKDIR /app

# Set environment flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install system dependencies if any
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app
COPY pytest.ini .
COPY tests/ ./tests

# Copy built frontend assets from stage 1 into app/static
COPY --from=frontend-builder /build/../app/static ./app/static

# Expose port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run FastAPI with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
