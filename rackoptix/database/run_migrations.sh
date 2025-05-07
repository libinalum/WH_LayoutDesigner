#!/bin/bash
# Database migration script for RackOptix

set -e

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-rackoptix}
DB_USER=${DB_USER:-rackoptix}
DB_PASSWORD=${DB_PASSWORD:-rackoptix_password}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to execute SQL file
execute_sql_file() {
    local file=$1
    local filename=$(basename "$file")
    
    echo -e "${BLUE}Running migration: ${filename}${NC}"
    
    # Check if the migration has already been applied
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT 1 FROM migration_history WHERE filename = '$filename'" | grep -q 1; then
        echo -e "${YELLOW}Migration $filename has already been applied. Skipping.${NC}"
        return 0
    fi
    
    # Execute the SQL file
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file"; then
        # Record the migration in the history table
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "INSERT INTO migration_history (filename, applied_at) VALUES ('$filename', NOW())"
        echo -e "${GREEN}Migration $filename completed successfully.${NC}"
    else
        echo -e "${RED}Migration $filename failed.${NC}"
        return 1
    fi
}

# Main script

echo -e "${BLUE}Starting RackOptix database migrations...${NC}"

# Check if PostgreSQL is available
until PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q'; do
  echo -e "${YELLOW}PostgreSQL is unavailable - sleeping${NC}"
  sleep 1
done

echo -e "${GREEN}PostgreSQL is available. Proceeding with migrations.${NC}"

# Create migration_history table if it doesn't exist
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
CREATE TABLE IF NOT EXISTS migration_history (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);"

# Get all migration files and sort them
migration_files=$(find "$(dirname "$0")/migrations" -name "*.sql" | sort)

# Execute each migration file
for file in $migration_files; do
    execute_sql_file "$file"
done

echo -e "${GREEN}All migrations completed successfully.${NC}"