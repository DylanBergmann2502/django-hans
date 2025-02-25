#!/bin/bash

# Make script executable from anywhere
cd "$(dirname "$0")/.."

# Use ENV from environment or default to local
ENV=${ENV:-local}
COMPOSE_FILE="deploy/${ENV}/web.yml"

# Check if Docker is installed and running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "Error: Docker is not running or not installed"
        exit 1
    fi
}

# Validate environment
validate_env() {
    if [ "$ENV" != "local" ] && [ "$ENV" != "production" ]; then
        echo "Error: Invalid environment. Must be 'local' or 'production'"
        exit 1
    fi

    if [ ! -f "$COMPOSE_FILE" ]; then
        echo "Error: Compose file not found: $COMPOSE_FILE"
        exit 1
    fi
}

validate_env

case "$1" in
    "check")
        # Check Docker versions
        echo "Checking Docker installations..."
        docker --version
        docker compose version
        ;;

    "build")
        check_docker
        docker compose -f $COMPOSE_FILE build
        ;;

    "up")
        check_docker
        shift  # Remove 'up' from arguments
        docker compose -f $COMPOSE_FILE up "$@"
        ;;

    "start")
        check_docker
        shift  # Remove 'up' from arguments
        docker compose -f $COMPOSE_FILE up --build --remove-orphans "$@"
        ;;

    "start-lite")
        check_docker
        shift  # Remove 'up' from arguments
        docker compose -f $COMPOSE_FILE up --build --remove-orphans postgres django vue
        ;;

    "stop")
        check_docker
        shift  # Remove 'stop' from arguments
        docker compose -f $COMPOSE_FILE stop "$@"
        ;;

    "down")
        check_docker
        shift  # Remove 'down' from arguments
        docker compose -f $COMPOSE_FILE down "$@"
        ;;

    "logs")
        check_docker
        docker compose -f $COMPOSE_FILE logs -f
        ;;

    "ps")
        # List running containers
        check_docker
        docker compose -f $COMPOSE_FILE ps
        ;;

    "restart")
        # Restart all containers
        check_docker
        docker compose -f $COMPOSE_FILE restart
        ;;

    "vue")
        # Run any Vue/NPM/Vite command
        # Usage: ./bin/run.sh vue <command>
        check_docker
        shift # Remove 'vue' from arguments
        docker compose -f $COMPOSE_FILE exec vue "$@"
        ;;

    "django")
        # Run any Django management command
        # Usage: ./bin/run.sh django <command>
        check_docker
        shift  # Remove 'django' from arguments
        docker compose -f $COMPOSE_FILE run --rm django python manage.py "$@"
        ;;

    "shell")
        check_docker
        docker compose -f $COMPOSE_FILE run --rm django python manage.py shell_plus
        ;;

    "script")
        # Run a Django script
        # Usage: ./bin/run.sh script <script_name>
        check_docker
        docker compose -f $COMPOSE_FILE run --rm django python manage.py runscript "$2"
        ;;

    "format")
        check_docker
        docker compose -f $COMPOSE_FILE run --rm django ruff format .
        ;;

    "freeze")
        check_docker
        docker compose -f $COMPOSE_FILE run --rm django pip list --format=freeze > requirements.lock
        ;;

    *)
        echo "Digital Signage Management Commands"
        echo "=================================="
        echo "Usage:"
        echo "  ./bin/run.sh <command>                # Uses local environment"
        echo "  ENV=production ./bin/run.sh <command> # Uses production environment"
        echo ""
        echo "Basic Commands:"
        echo "  check              - Check Docker installations"
        echo "  build              - Build all containers"
        echo "  up [options]       - Start containers in attached mode"
        echo "  start [options]    - Build and start containers with orphan removal"
        echo "  start-lite         - Build and start only \`django\`, \`postgres\`, and \`vue\`"
        echo "  stop [options]     - Stop containers"
        echo "  down [options]     - Stop and remove containers"
        echo "  logs               - View container logs"
        echo "  ps                 - List running containers"
        echo "  restart            - Restart all containers"
        echo ""
        echo "Vue Commands:"
        echo "  vue <command>    - Run any Vue/NPM/Vite command"
        echo ""
        echo "Django Commands:"
        echo "  django <command>   - Run any Django management command"
        echo "  shell              - Open Django shell_plus"
        echo "  script <name>      - Run a Django script"
        echo "  format             - Format Python code with ruff"
        echo "  freeze             - Update requirements.lock"
        ;;
esac
