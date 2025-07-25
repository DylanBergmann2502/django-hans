#!/bin/bash
# bin/run.sh

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

    "start:lite")
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
        docker compose -f $COMPOSE_FILE run --rm vue "$@"
        ;;

    "vue:lint")
        # Lint Vue code
        check_docker
        docker compose -f $COMPOSE_FILE run --rm vue npm run lint
        ;;

    "vue:format")
        # Format Vue code
        check_docker
        docker compose -f $COMPOSE_FILE run --rm vue npm run format
        ;;

    "vue:test")
        # Run Vue unit tests
        check_docker
        shift  # Remove 'vue:test' from arguments
        docker compose -f $COMPOSE_FILE run --rm vue npm run test:unit "$@"
        ;;

    "vue:install")
        # Install npm package
        check_docker
        shift  # Remove 'vue:install' from arguments
        docker compose -f $COMPOSE_FILE run --rm vue npm install "$@"
        ;;

    "vue:uninstall")
        # Uninstall npm package
        check_docker
        shift  # Remove 'vue:uninstall' from arguments
        docker compose -f $COMPOSE_FILE run --rm vue npm uninstall "$@"
        ;;

    "vue:ncu")
        # Check for npm package updates
        check_docker
        shift  # Remove 'vue:ncu' from arguments
        docker compose -f $COMPOSE_FILE run --rm vue npx npm-check-updates "$@"
        ;;

    "vue:update")
        # Update npm dependencies
        check_docker
        docker compose -f $COMPOSE_FILE run --rm vue npm update
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
        check_docker
        docker compose -f $COMPOSE_FILE run --rm django python manage.py runscript "$2"
        ;;

    "format")
        # Format Django code with ruff
        check_docker
        shift  # Remove 'format' from arguments
        docker compose -f $COMPOSE_FILE run --rm django ruff format "${@:-.}"
        ;;

    "lint")
        # Lint Django code with ruff
        check_docker
        shift  # Remove 'lint' from arguments
        docker compose -f $COMPOSE_FILE run --rm django ruff check "${@:-.}"
        ;;

    "mypy")
        check_docker
        shift  # Remove 'mypy' from arguments
        docker compose -f $COMPOSE_FILE run --rm django mypy "${@:-.}"
        ;;

    "pytest")
        check_docker
        shift  # Remove 'pytest' from arguments
        docker compose -f $COMPOSE_FILE run --rm django pytest "$@"
        ;;

    "freeze")
        check_docker
        docker compose -f $COMPOSE_FILE run --rm django pip list --format=freeze > requirements.lock
        ;;

    *)
        echo "Django Hans Management Commands"
        echo "=================================="
        echo "Usage:"
        echo "  ./bin/run.sh <command>                # Uses local environment"
        echo "  ENV=production ./bin/run.sh <command> # Uses production environment"
        echo ""
        echo "Basic Commands:"
        echo "  check               - Check Docker installations"
        echo "  build               - Build all containers"
        echo "  up [options]        - Start containers in attached mode"
        echo "  start [options]     - Build and start containers with orphan removal"
        echo "  start:lite          - Build and start only \`django\`, \`postgres\`, and \`vue\`"
        echo "  stop [options]      - Stop containers"
        echo "  down [options]      - Stop and remove containers"
        echo "  logs                - View container logs"
        echo "  ps                  - List running containers"
        echo "  restart             - Restart all containers"
        echo ""
        echo "Vue Commands:"
        echo "  vue <command>           - Run any Vue/NPM/Vite command"
        echo "  vue:lint                - Lint Vue code"
        echo "  vue:format              - Format Vue code with Prettier"
        echo "  vue:test [options]      - Run Vue unit tests"
        echo "  vue:install <pkg>       - Install npm package(s)"
        echo "  vue:uninstall <pkg>     - Uninstall npm package(s)"
        echo "  vue:ncu [options]       - Check for npm package updates"
        echo "  vue:update              - Update npm dependencies"
        echo ""
        echo "Django Commands:"
        echo "  django <command>     - Run any Django management command"
        echo "  shell                - Open Django shell_plus"
        echo "  script <name>        - Run a Django script"
        echo "  format [paths]       - Format Django code with ruff (defaults to entire codebase)"
        echo "  lint [paths]         - Lint Django code with ruff (defaults to entire codebase)"
        echo "  mypy [paths]         - Run mypy static type checking (defaults to entire codebase)"
        echo "  pytest [options]     - Run Django tests"
        echo "  freeze               - Update requirements.lock"
        ;;
esac
