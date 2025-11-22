#!/bin/bash

# Production deployment script
set -e

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/opt/backups/mini-coursera"
APP_DIR="/opt/mini-coursera"
COMPOSE_FILE="$APP_DIR/docker-compose.yml"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root for security reasons"
fi

# Check if docker and docker-compose are installed
command -v docker >/dev/null 2>&1 || log_error "Docker is not installed"
command -v docker-compose >/dev/null 2>&1 || log_error "Docker Compose is not installed"

# Create backup directory
mkdir -p "$BACKUP_DIR/$(date +%Y%m%d)"

# Function to backup database
backup_database() {
    log_info "Creating database backup..."
    
    local backup_file="$BACKUP_DIR/$(date +%Y%m%d)/backup_$(date +%H%M%S).bak"
    
    docker exec mini-coursera-db /opt/mssql-tools/bin/sqlcmd \
        -S localhost \
        -U sa \
        -P "$DB_PASSWORD" \
        -Q "BACKUP DATABASE MiniCoursera TO DISK='/var/opt/mssql/backup/backup_$(date +%Y%m%d_%H%M%S).bak'"
    
    if [ $? -eq 0 ]; then
        log_info "Database backup completed: $backup_file"
    else
        log_error "Database backup failed"
    fi
}

# Function to backup application files
backup_files() {
    log_info "Creating application files backup..."
    
    local backup_archive="$BACKUP_DIR/$(date +%Y%m%d)/app_backup_$(date +%H%M%S).tar.gz"
    
    tar -czf "$backup_archive" \
        -C "$APP_DIR" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='backend/uploads' \
        .
    
    if [ $? -eq 0 ]; then
        log_info "Application backup completed: $backup_archive"
    else
        log_error "Application backup failed"
    fi
}

# Function to check service health
check_health() {
    local service=$1
    local max_attempts=30
    local attempt=0
    
    log_info "Checking health of $service..."
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose -f "$COMPOSE_FILE" exec "$service" curl -f http://localhost:3000/health >/dev/null 2>&1; then
            log_info "$service is healthy"
            return 0
        fi
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_error "$service failed health check after $max_attempts attempts"
}

# Function to rollback
rollback() {
    log_warn "Rolling back to previous version..."
    
    # Stop current containers
    docker-compose -f "$COMPOSE_FILE" down
    
    # Restore from backup (implement as needed)
    # This would involve restoring the database and application files
    
    log_info "Rollback completed. Please verify system status."
}

# Main deployment process
main() {
    log_info "Starting deployment process..."
    
    # Change to application directory
    cd "$APP_DIR" || log_error "Cannot change to application directory: $APP_DIR"
    
    # Load environment variables
    if [ -f ".env.production" ]; then
        source .env.production
    else
        log_error "Production environment file not found"
    fi
    
    # Create backups
    backup_files
    backup_database
    
    # Pull latest images
    log_info "Pulling latest Docker images..."
    if ! docker-compose pull; then
        log_error "Failed to pull Docker images"
    fi
    
    # Stop services gracefully
    log_info "Stopping services..."
    docker-compose down --timeout 30
    
    # Start services with health checks
    log_info "Starting services..."
    if ! docker-compose up -d; then
        log_error "Failed to start services"
    fi
    
    # Wait for services to be ready
    sleep 30
    
    # Health checks
    check_health "backend"
    check_health "frontend"
    
    # Test critical endpoints
    log_info "Testing critical endpoints..."
    
    # Test API health
    if ! curl -f "http://localhost/api/health" >/dev/null 2>&1; then
        log_warn "API health check failed, attempting rollback..."
        rollback
    fi
    
    # Test frontend
    if ! curl -f "http://localhost/" >/dev/null 2>&1; then
        log_warn "Frontend health check failed, attempting rollback..."
        rollback
    fi
    
    # Cleanup old images and containers
    log_info "Cleaning up old Docker resources..."
    docker system prune -f --filter "until=24h"
    
    # Final health check
    log_info "Performing final health checks..."
    sleep 10
    
    if curl -f "http://localhost/api/health" >/dev/null 2>&1 && curl -f "http://localhost/" >/dev/null 2>&1; then
        log_info "✅ Deployment completed successfully!"
        
        # Send notification (if configured)
        if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
            curl -X POST -H 'Content-type: application/json' \
                --data '{"text":"✅ Mini Coursera production deployment successful!"}' \
                "$SLACK_WEBHOOK_URL"
        fi
    else
        log_error "❌ Deployment verification failed!"
    fi
}

# Trap for cleanup on script exit
trap 'log_warn "Script interrupted. Check system status."' INT TERM

# Run main function
main "$@"