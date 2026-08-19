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

echo "Downloading agent.php..."
curl -sSL "https://raw.githubusercontent.com/wafazz/git-sync/main/agent/agent.php" -o "$INSTALL_DIR/agent.php"

echo "Registering agent with ${MANAGER_URL}..."
php "$INSTALL_DIR/agent.php" --url="$MANAGER_URL" --token="$AGENT_TOKEN"

echo ""
echo "========================================================"
echo "  Agent Installed & Registered Successfully!            "
echo "========================================================"
echo ""
echo "To run the agent in background:"
echo "  nohup php $INSTALL_DIR/agent.php --daemon > $INSTALL_DIR/agent.log 2>&1 &"
echo ""
echo "Or run manually:"
echo "  php $INSTALL_DIR/agent.php --daemon"
