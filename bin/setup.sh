#!/bin/bash
# bin/setup.sh

# Navigate to project root
cd "$(dirname "$0")/.."

# Use ENV from environment or default to local
ENV=${ENV:-local}
SETUP_FILE="deploy/${ENV}/setup.yml"
WEB_FILE="deploy/${ENV}/web.yml"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored status messages
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if a command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_status $RED "❌ $1 is not installed"
        return 1
    else
        print_status $GREEN "✓ $1 is installed"
        return 0
    fi
}

# Check for required commands
print_status $YELLOW "Checking required dependencies..."
check_docker=true
check_compose=true

# Check Docker
if ! check_command "docker"; then
    check_docker=false
fi

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    print_status $RED "❌ Docker Compose is not installed"
    check_compose=false
else
    print_status $GREEN "✓ Docker Compose is installed"
fi

# Exit if requirements are not met
if [ "$check_docker" = false ] || [ "$check_compose" = false ]; then
    print_status $RED "Please install the missing dependencies and try again."
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    print_status $RED "Docker daemon is not running. Please start Docker and try again."
    exit 1
fi

# Clean up existing containers and volumes
print_status $YELLOW "Cleaning up existing containers and volumes..."
if ! docker compose -f $WEB_FILE down -v; then
    print_status $RED "Failed to clean up existing containers and volumes"
    exit 1
fi

# Run setup services in detached mode
print_status $YELLOW "Starting setup services..."
if ! docker compose -f $SETUP_FILE up --build -d; then
    print_status $RED "Failed to start setup services"
    exit 1
fi

# Clean up setup services but keep volumes
print_status $YELLOW "Cleaning up setup services..."
docker compose -f $SETUP_FILE down --remove-orphans

# Start main application services
print_status $YELLOW "Building and starting all main application services..."
if ! docker compose -f $WEB_FILE up -d --build --remove-orphans; then
    print_status $RED "Failed to start services"
    exit 1
fi

print_status $GREEN "✨ Setup completed successfully!"
print_status $GREEN "The application is now running. You can access it at:"
print_status $GREEN "- Frontend: http://localhost:5173"
print_status $GREEN "- Backend API: http://localhost:8000"
print_status $GREEN "- Admin interface: http://localhost:8000/admin/"
print_status $GREEN "- Flower dashboard: http://localhost:5555"
print_status $GREEN "- MinIO Console: http://localhost:9001"

exit 0
