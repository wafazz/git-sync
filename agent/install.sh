#!/usr/bin/env bash
set -e

# CoreSentinel Agent One-Line Installer
# Usage:
#   curl -sSL https://raw.githubusercontent.com/wafazz/git-sync/main/agent/install.sh | bash -s -- --url=http://your-manager.com --token=cs_agent_xxx

INSTALL_DIR="/opt/cs-agent"
MANAGER_URL=""
AGENT_TOKEN=""

for arg in "$@"; do
  case $arg in
    --url=*)
      MANAGER_URL="${arg#*=}"
      shift
      ;;
    --token=*)
      AGENT_TOKEN="${arg#*=}"
      shift
      ;;
  esac
done

if [ -z "$MANAGER_URL" ] || [ -z "$AGENT_TOKEN" ]; then
  echo "Usage: curl -sSL https://raw.githubusercontent.com/wafazz/git-sync/main/agent/install.sh | bash -s -- --url=<MANAGER_URL> --token=<AGENT_TOKEN>"
  exit 1
fi

echo "========================================================"
echo "  Installing CoreSentinel Server Agent Daemon           "
echo "========================================================"

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo "Downloading latest agent.php..."
curl -sSL "https://raw.githubusercontent.com/wafazz/git-sync/main/agent/agent.php" -o "$INSTALL_DIR/agent.php"

echo "Registering agent with ${MANAGER_URL}..."
php "$INSTALL_DIR/agent.php" --url="$MANAGER_URL" --token="$AGENT_TOKEN"

# Kill any previous agent process if running
pkill -f "agent.php --daemon" || true

# Start background daemon
nohup php "$INSTALL_DIR/agent.php" --url="$MANAGER_URL" --daemon > "$INSTALL_DIR/agent.log" 2>&1 &

echo ""
echo "========================================================"
echo "  Agent Installed, Registered & Daemon Started!         "
echo "========================================================"
echo "Process PID : $!"
echo "Log File    : $INSTALL_DIR/agent.log"
echo ""
echo "Check live daemon output with:"
echo "  tail -f $INSTALL_DIR/agent.log"
